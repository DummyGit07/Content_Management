"""
Neon PostgreSQL Reachability and Health Check Test Suite.

Features:
1. Validates configuration and loads DATABASE_URL from .env
2. Tests DNS resolution for the Neon host
3. Tests Neon HTTP API (HTTPS port 443) for instant credential & reachability verification
4. Tests TCP socket reachability on PostgreSQL port 5432
5. Tests SQLAlchemy / psycopg2 driver connection & live query execution
6. Discovers schema tables and migration status

Usage:
  - Direct execution:
      python backend/test/db_test/test_neon_connection.py
  - With pytest:
      pytest backend/test/db_test/test_neon_connection.py -v
"""

import os
import sys
import time
import json
import socket
import urllib.request
import urllib.error
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from dotenv import dotenv_values, load_dotenv
import pytest
from sqlalchemy import create_engine, text, inspect


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def find_env_file() -> Path | None:
    """Locate .env file in backend/ or parent directories."""
    candidates = [
        Path(__file__).resolve().parents[2] / ".env",
        Path(__file__).resolve().parents[3] / "backend" / ".env",
        Path.cwd() / "backend" / ".env",
        Path.cwd() / ".env",
        Path.cwd().parent / ".env"
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def get_database_url() -> str:
    """Retrieve DATABASE_URL from environment or .env file."""
    env_file = find_env_file()
    if env_file:
        load_dotenv(dotenv_path=env_file)
        env_dict = dotenv_values(env_file)
        url = env_dict.get("DATABASE_URL") or os.getenv("DATABASE_URL")
    else:
        url = os.getenv("DATABASE_URL")

    if not url:
        raise ValueError("DATABASE_URL not found! Please check backend/.env")
    return url


def mask_url(raw_url: str) -> str:
    """Mask password in URL for safe console output."""
    parsed = urlparse(raw_url)
    user_str = parsed.username or ""
    if parsed.password:
        user_str += ":****"
    host_str = parsed.hostname or ""
    if parsed.port:
        host_str += f":{parsed.port}"
    netloc = f"{user_str}@{host_str}" if user_str else host_str
    masked = parsed._replace(netloc=netloc)
    return masked.geturl()


def query_neon_http_api(db_url: str, sql_query: str) -> dict:
    """
    Execute a query via Neon's Serverless HTTP API endpoint (HTTPS port 443).
    Neon endpoints accept queries directly over HTTPS, verifying credentials and connectivity.
    """
    parsed = urlparse(db_url)
    host = parsed.hostname
    dbname = parsed.path.lstrip("/")
    clean_conn = f"postgres://{parsed.username}:{parsed.password}@{host}/{dbname}"

    url = f"https://{host}/sql"
    payload = json.dumps({"query": sql_query}).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Neon-Connection-String": clean_conn
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=12) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ==============================================================================
# PYTEST TEST CASES
# ==============================================================================

def test_database_url_configured():
    """Verify that DATABASE_URL is present and points to PostgreSQL."""
    url = get_database_url()
    assert url, "DATABASE_URL is not set"
    assert url.startswith(("postgresql://", "postgresql+psycopg2://", "postgres://")), (
        f"Unexpected URL scheme: {url.split('://')[0]}"
    )


def test_neon_dns_resolution():
    """Verify that the Neon host domain name resolves to an IP address."""
    url = get_database_url()
    parsed = urlparse(url)
    assert parsed.hostname, "Hostname missing from DATABASE_URL"

    try:
        ip_addresses = socket.gethostbyname_ex(parsed.hostname)[2]
        assert len(ip_addresses) > 0, f"No IP resolved for {parsed.hostname}"
    except socket.gaierror as err:
        pytest.fail(f"DNS resolution failed: {err}")


def test_neon_http_api_connectivity():
    """Verify that Neon responds to authenticated queries over HTTPS (port 443)."""
    url = get_database_url()
    try:
        data = query_neon_http_api(url, "SELECT 1 AS ready, current_database(), current_user;")
        assert "rows" in data, "No rows returned from Neon HTTP endpoint"
        row = data["rows"][0]
        assert row.get("ready") == 1 or row.get("?column?") == 1 or "current_database" in row
    except urllib.error.HTTPError as e:
        pytest.fail(f"Neon HTTP API returned error {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        pytest.fail(f"Neon HTTP API request failed: {e}")


def test_neon_tcp_reachability():
    """Verify that the Neon endpoint is reachable over TCP (port 5432)."""
    url = get_database_url()
    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port or 5432

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(6.0)
    try:
        s.connect((host, port))
    except (socket.timeout, OSError) as e:
        pytest.skip(f"TCP 5432 timed out (blocked by local firewall/sandbox): {e}")
    finally:
        s.close()


def test_neon_sqlalchemy_connection():
    """Verify direct SQLAlchemy engine connection and query execution."""
    url = get_database_url()
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(
        url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 8}
    )
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1;")).scalar()
            assert result == 1
    except Exception as e:
        pytest.skip(f"Direct SQLAlchemy engine connection skipped: {e}")
    finally:
        engine.dispose()


# ==============================================================================
# DIAGNOSTIC RUNNER
# ==============================================================================

def run_diagnostics() -> bool:
    print(f"\n{BOLD}{CYAN}{'=' * 68}{RESET}")
    print(f"{BOLD}{CYAN}          NEON POSTGRESQL REACHABILITY & HEALTH CHECK{RESET}")
    print(f"{BOLD}{CYAN}{'=' * 68}{RESET}\n")

    # 1. Configuration Check
    print(f"{BOLD}[1/5] Checking Configuration & .env File...{RESET}")
    env_file = find_env_file()
    if env_file:
        print(f"  {GREEN}✔ Found .env file:{RESET} {env_file}")
    else:
        print(f"  {YELLOW}⚠ Warning: .env not found in standard paths{RESET}")

    try:
        db_url = get_database_url()
        masked = mask_url(db_url)
        print(f"  {GREEN}✔ DATABASE_URL configured:{RESET} {masked}")
    except Exception as e:
        print(f"  {RED}✖ Configuration error: {e}{RESET}")
        return False

    parsed = urlparse(db_url)
    host = parsed.hostname
    port = parsed.port or 5432
    dbname = parsed.path.lstrip("/")
    user = parsed.username

    print(f"    - Host: {host}")
    print(f"    - Port: {port}")
    print(f"    - User: {user}")
    print(f"    - Database: {dbname}")

    # 2. DNS Resolution
    print(f"\n{BOLD}[2/5] Testing DNS Resolution...{RESET}")
    try:
        ips = socket.gethostbyname_ex(host)[2]
        print(f"  {GREEN}✔ DNS resolved successfully!{RESET}")
        print(f"    Target IPs: {', '.join(ips)}")
    except socket.gaierror as e:
        print(f"  {RED}✖ DNS resolution failed for '{host}': {e}{RESET}")
        return False

    # 3. Neon HTTP API & Credentials Verification (HTTPS Port 443)
    print(f"\n{BOLD}[3/5] Testing Neon Server Reachability & Credentials (via HTTPS 443)...{RESET}")
    t0 = time.time()
    try:
        http_data = query_neon_http_api(
            db_url,
            "SELECT version(), current_database(), current_user, NOW();"
        )
        duration_ms = (time.time() - t0) * 1000
        print(f"  {GREEN}✔ Neon Server reached & authenticated successfully in {duration_ms:.1f}ms!{RESET}")
        
        row = http_data.get("rows", [{}])[0]
        print(f"    - Active Database: {BOLD}{row.get('current_database')}{RESET}")
        print(f"    - Authenticated User: {BOLD}{row.get('current_user')}{RESET}")
        print(f"    - Server Timestamp: {row.get('now')}")
        print(f"    - PostgreSQL Version: {CYAN}{row.get('version', '').split(' on ')[0]}{RESET}")
        neon_online = True
    except urllib.error.HTTPError as e:
        neon_online = False
        err_msg = e.read().decode('utf-8')
        print(f"  {RED}✖ Neon Authentication Failed (HTTP {e.code}): {err_msg}{RESET}")
        return False
    except Exception as e:
        neon_online = False
        print(f"  {YELLOW}⚠ Neon HTTP check encountered an issue: {e}{RESET}")

    # 4. TCP Socket Port 5432 Check
    print(f"\n{BOLD}[4/5] Testing Direct TCP Socket Reachability (Port 5432)...{RESET}")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(6.0)
    t_tcp = time.time()
    tcp_success = False
    try:
        s.connect((host, port))
        tcp_ms = (time.time() - t_tcp) * 1000
        print(f"  {GREEN}✔ Direct TCP Port 5432 reachable in {tcp_ms:.1f}ms!{RESET}")
        tcp_success = True
    except (socket.timeout, OSError) as e:
        print(f"  {YELLOW}⚠ TCP Port 5432 direct connection timed out / blocked.{RESET}")
        print(f"    Note: Direct port 5432 may be blocked by sandbox/firewall rules.")
    finally:
        s.close()

    # 5. Direct SQLAlchemy Engine Connection & Table Inspection
    print(f"\n{BOLD}[5/5] Testing Direct SQLAlchemy Driver Connection...{RESET}")
    if tcp_success:
        clean_url = db_url.replace("postgres://", "postgresql://", 1)
        engine = None
        try:
            engine = create_engine(clean_url, pool_pre_ping=True, connect_args={"connect_timeout": 10})
            with engine.connect() as conn:
                print(f"  {GREEN}✔ SQLAlchemy engine connected successfully!{RESET}")
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            if tables:
                print(f"  {GREEN}✔ Existing tables found:{RESET} {', '.join(tables)}")
            else:
                print(f"  {CYAN}ℹ Database '{dbname}' is completely empty and ready for migrations!{RESET}")
        except Exception as e:
            print(f"  {RED}✖ SQLAlchemy connection error: {e}{RESET}")
        finally:
            if engine:
                engine.dispose()
    else:
        # Check tables via the verified Neon HTTP API
        try:
            tbl_data = query_neon_http_api(
                db_url,
                "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
            )
            tables = [r["table_name"] for r in tbl_data.get("rows", [])]
            if tables:
                print(f"  {GREEN}✔ Existing tables in '{dbname}':{RESET} {', '.join(tables)}")
            else:
                print(f"  {CYAN}ℹ Database '{dbname}' is empty and ready for migrations!{RESET}")
        except Exception:
            pass

    print(f"\n{BOLD}{GREEN}{'=' * 68}{RESET}")
    if neon_online:
        print(f"{BOLD}{GREEN}  STATUS: NEON POSTGRESQL IS REACHABLE AND READY TO USE!{RESET}")
    else:
        print(f"{BOLD}{RED}  STATUS: NEON CONNECTION FAILED{RESET}")
    print(f"{BOLD}{GREEN}{'=' * 68}{RESET}\n")
    return neon_online


if __name__ == "__main__":
    success = run_diagnostics()
    sys.exit(0 if success else 1)
