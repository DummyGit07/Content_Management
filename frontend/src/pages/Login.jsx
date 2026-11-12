import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/auth";

// Symbols for representation
const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const KeyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="m21 2-9.6 9.6" />
        <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
);

const UserPlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

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
                setSuccessMsg("Account created! You can now sign in.");
                setIsRegistering(false);
                setUserPassword("");
            } else {
                await login(userName, userPassword);
            }
        } catch (err) {
            setError(err.message || "Authentication failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={styles.container}>
            {/* Ambient Background Glow for Glassmorphism */}
            <div style={styles.orbPurple} />
            <div style={styles.orbBlue} />
            <div style={styles.orbPink} />

            {/* Glassmorphic Card */}
            <div style={styles.glassCard}>
                {/* Top Symbol Avatar */}
                <div style={styles.avatarCircle}>
                    {isRegistering ? <UserPlusIcon /> : <UserIcon />}
                </div>

                {/* Tab Switcher: High Contrast Active/Inactive states */}
                <div style={styles.tabContainer}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(false);
                            setError("");
                            setSuccessMsg("");
                        }}
                        style={{
                            ...styles.tabBtn,
                            ...(isRegistering ? styles.inactiveTab : styles.activeTab),
                        }}
                    >
                        <KeyIcon />
                        <span>Sign In</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(true);
                            setError("");
                            setSuccessMsg("");
                        }}
                        style={{
                            ...styles.tabBtn,
                            ...(isRegistering ? styles.activeTab : styles.inactiveTab),
                        }}
                    >
                        <UserPlusIcon />
                        <span>Register</span>
                    </button>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}
                {successMsg && <div style={styles.successBox}>{successMsg}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Username with symbol */}
                    <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>
                            <UserIcon />
                        </span>
                        <input
                            type="text"
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Username"
                            style={styles.input}
                        />
                    </div>

                    {/* Password with symbol */}
                    <div style={styles.inputWrapper}>
                        <span style={styles.inputIcon}>
                            <LockIcon />
                        </span>
                        <input
                            type="password"
                            required
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            placeholder="Password"
                            style={styles.input}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            ...styles.submitBtn,
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        <span>{submitting ? "..." : isRegistering ? "Register" : "Sign In"}</span>
                        <ArrowRightIcon />
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 45%, #090d16 100%)",
        overflow: "hidden",
        padding: "20px",
        boxSizing: "border-box",
    },
    orbPurple: {
        position: "absolute",
        top: "12%",
        left: "18%",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(147, 51, 234, 0) 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
    },
    orbBlue: {
        position: "absolute",
        bottom: "12%",
        right: "18%",
        width: "380px",
        height: "380px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0) 70%)",
        filter: "blur(70px)",
        pointerEvents: "none",
    },
    orbPink: {
        position: "absolute",
        top: "30%",
        right: "12%",
        width: "250px",
        height: "250px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.22) 0%, rgba(236, 72, 153, 0) 70%)",
        filter: "blur(50px)",
        pointerEvents: "none",
    },
    glassCard: {
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "380px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        padding: "36px 28px",
        boxSizing: "border-box",
        textAlign: "center",
    },
    avatarCircle: {
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        margin: "0 auto 20px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        color: "#ffffff",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    },
    tabContainer: {
        display: "flex",
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        borderRadius: "12px",
        padding: "4px",
        marginBottom: "24px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    tabBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "9px 0",
        border: "none",
        borderRadius: "9px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    activeTab: {
        backgroundColor: "#ffffff",
        color: "#0f172a",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    inactiveTab: {
        backgroundColor: "transparent",
        color: "#94a3b8",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.07)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        transition: "all 0.2s ease",
    },
    inputIcon: {
        position: "absolute",
        left: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        pointerEvents: "none",
    },
    input: {
        width: "100%",
        padding: "13px 14px 13px 44px",
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#ffffff",
        fontSize: "14px",
        boxSizing: "border-box",
    },
    submitBtn: {
        marginTop: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "13px 20px",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
        transition: "all 0.2s ease",
    },
    bottomToggle: {
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "13px",
    },
    toggleText: {
        color: "#94a3b8",
    },
    toggleLink: {
        background: "none",
        border: "none",
        color: "#60a5fa",
        fontWeight: "600",
        fontSize: "13px",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
        textUnderlineOffset: "3px",
    },
    errorBox: {
        padding: "10px 14px",
        marginBottom: "16px",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        border: "1px solid rgba(239, 68, 68, 0.45)",
        borderRadius: "10px",
        color: "#fca5a5",
        fontSize: "13px",
        textAlign: "left",
    },
    successBox: {
        padding: "10px 14px",
        marginBottom: "16px",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        border: "1px solid rgba(34, 197, 94, 0.45)",
        borderRadius: "10px",
        color: "#86efac",
        fontSize: "13px",
        textAlign: "left",
    },
};
