// frontend/src/pages/Home.jsx
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2>Contact Management System</h2>
                <button onClick={logout} style={styles.logoutBtn}>
                    Logout
                </button>
            </header>

            <main style={styles.card}>
                <h3>Welcome, {user?.username || "User"}! 👋</h3>
                <p>
                    <strong>User ID:</strong> {user?.id}
                </p>

                <div style={styles.statusBox}>
                    ✅ <strong>Status:</strong> Authentication pipeline connected successfully!
                    <br />
                    You are logged in with a valid JWT token.
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "700px",
        margin: "50px auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0 20px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: "15px",
    },
    logoutBtn: {
        backgroundColor: "#ef4444",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
    },
    card: {
        marginTop: "30px",
        padding: "30px",
        borderRadius: "10px",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
    },
    statusBox: {
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#ecfdf5",
        color: "#065f46",
        borderRadius: "8px",
        border: "1px solid #a7f3d0",
        lineHeight: "1.6",
    },
};