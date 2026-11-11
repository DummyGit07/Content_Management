import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/auth";

export default function Login() {
    const { login } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);

    const [userName, setUserName] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setSubmitting(true);

        try {
            if (isRegistering) {
                await registerUser(userName, userPassword);
                setSuccessMsg("Account created! Please log in.");
                setIsRegistering(false);
                setUserPassword("");
            } else {
                await login(userName, userPassword);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={styles.card}>
            <h2>{isRegistering ? "Create an Account" : "Sign In"}</h2>

            {error && <div style={styles.error}>{error}</div>}
            {successMsg && <div style={styles.success}>{successMsg}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter username"
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        required
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter password"
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={submitting} style={styles.button}>
                    {submitting
                        ? "Processing..."
                        : isRegistering
                            ? "Register"
                            : "Login"}
                </button>
            </form>

            <p style={styles.toggleText}>
                {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                    type="button"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError("");
                        setSuccessMsg("");
                    }}
                    style={styles.linkButton}
                >
                    {isRegistering ? "Sign In" : "Register"}
                </button>
            </p>
        </div>
    );
}

const styles = {
    card: {
        maxWidth: "380px",
        margin: "80px auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#fff",
    },
    form: { display: "flex", flexDirection: "column", gap: "15px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "5px", textAlign: "left" },
    input: { padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" },
    button: {
        padding: "10px",
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
    },
    error: { backgroundColor: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "6px", marginBottom: "15px" },
    success: { backgroundColor: "#dcfce7", color: "#16a34a", padding: "10px", borderRadius: "6px", marginBottom: "15px" },
    toggleText: { marginTop: "20px", fontSize: "14px", color: "#555" },
    linkButton: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: "bold" },
};