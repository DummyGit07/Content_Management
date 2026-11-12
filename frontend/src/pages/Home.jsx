import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
} from "../api/contacts";

// SVG Symbols
const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const PAGE_SIZE = 3;

export default function Home() {
    const { token, logout } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function loadContacts() {
        if (!token) return;
        try {
            const data = await fetchContacts(token);
            setContacts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load contacts:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadContacts();
    }, [token]);

    const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const currentContacts = contacts.slice(startIndex, startIndex + PAGE_SIZE);

    function handleOpenAdd() {
        setEditingContact(null);
        setFormData({ name: "", phone: "" });
        setFormError("");
        setIsModalOpen(true);
    }

    function handleOpenEdit(contact) {
        setEditingContact(contact);
        setFormData({ name: contact.name || "", phone: contact.number || "" });
        setFormError("");
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingContact(null);
        setFormData({ name: "", phone: "" });
        setFormError("");
    }

    async function handleSave(e) {
        e.preventDefault();
        setFormError("");

        const trimmedName = formData.name.trim();
        const trimmedPhone = formData.phone.trim();

        if (!trimmedName || !trimmedPhone) {
            setFormError("Name and phone number are required.");
            return;
        }

        setIsSaving(true);
        try {
            if (editingContact) {
                await updateContact(token, editingContact.id, {
                    name: trimmedName,
                    number: trimmedPhone,
                });
            } else {
                await addContact(token, {
                    name: trimmedName,
                    number: trimmedPhone,
                });
            }
            await loadContacts();
            handleCloseModal();
        } catch (err) {
            setFormError(err.message || "Failed to save contact.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(contactId) {
        try {
            await deleteContact(token, contactId);
            const remainingCount = contacts.length - 1;
            const newTotalPages = Math.max(1, Math.ceil(remainingCount / PAGE_SIZE));
            if (safeCurrentPage > newTotalPages) {
                setCurrentPage(newTotalPages);
            }
            await loadContacts();
        } catch (err) {
            alert(err.message || "Failed to delete contact.");
        }
    }

    return (
        <div style={styles.container}>
            {/* Ambient Glowing Background Orbs */}
            <div style={styles.orbPurple} />
            <div style={styles.orbBlue} />
            <div style={styles.orbPink} />

            {/* Glassmorphic Card */}
            <div style={styles.glassCard}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Contacts</h1>
                    <div style={styles.headerActions}>
                        <button
                            onClick={handleOpenAdd}
                            style={styles.addBtn}
                            title="Add Contact"
                            aria-label="Add Contact"
                        >
                            <PlusIcon />
                            <span>Add Contact</span>
                        </button>
                        <button
                            onClick={logout}
                            style={styles.logoutBtn}
                            title="Logout"
                            aria-label="Logout"
                        >
                            <LogoutIcon />
                        </button>
                    </div>
                </div>

                {/* Contacts List */}
                <div style={styles.listContainer}>
                    {loading ? (
                        <div style={styles.emptyText}>Loading contacts...</div>
                    ) : contacts.length === 0 ? (
                        <div style={styles.emptyText}>No contacts yet. Click "Add Contact" to start.</div>
                    ) : (
                        currentContacts.map((contact) => (
                            <div key={contact.id} style={styles.contactItem}>
                                <div style={styles.contactInfo}>
                                    <div style={styles.contactName}>{contact.name}</div>
                                    <div style={styles.contactPhone}>
                                        <PhoneIcon />
                                        <span>{contact.number}</span>
                                    </div>
                                </div>
                                <div style={styles.contactActions}>
                                    <button
                                        onClick={() => handleOpenEdit(contact)}
                                        style={styles.editBtn}
                                        title="Update contact"
                                        aria-label="Update contact"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contact.id)}
                                        style={styles.deleteBtn}
                                        title="Delete contact"
                                        aria-label="Delete contact"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {contacts.length > 0 && (
                    <div style={styles.pagination}>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safeCurrentPage <= 1}
                            style={{
                                ...styles.arrowBtn,
                                opacity: safeCurrentPage <= 1 ? 0.35 : 1,
                                cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                            }}
                            title="Previous page"
                            aria-label="Previous page"
                        >
                            <ArrowLeftIcon />
                        </button>
                        <span style={styles.pageInfo}>
                            {safeCurrentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage >= totalPages}
                            style={{
                                ...styles.arrowBtn,
                                opacity: safeCurrentPage >= totalPages ? 0.35 : 1,
                                cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                            }}
                            title="Next page"
                            aria-label="Next page"
                        >
                            <ArrowRightIcon />
                        </button>
                    </div>
                )}
            </div>

            {/* Glassmorphic Modal Dialog for Add / Update */}
            {isModalOpen && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div
                        style={styles.modalCard}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={styles.modalTitle}>
                            {editingContact ? "Update Contact" : "Add Contact"}
                        </h2>

                        {formError && <div style={styles.errorBox}>{formError}</div>}

                        <form onSubmit={handleSave} style={styles.form}>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <UserIcon />
                                </span>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Contact Name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>
                                    <PhoneIcon />
                                </span>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    style={styles.saveBtn}
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
        padding: "30px 16px",
        boxSizing: "border-box",
        textAlign: "left",
    },
    orbPurple: {
        position: "absolute",
        top: "10%",
        left: "15%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(147, 51, 234, 0) 70%)",
        filter: "blur(70px)",
        pointerEvents: "none",
    },
    orbBlue: {
        position: "absolute",
        bottom: "10%",
        right: "15%",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
    },
    orbPink: {
        position: "absolute",
        top: "40%",
        right: "10%",
        width: "280px",
        height: "280px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0) 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
    },
    glassCard: {
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "580px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        padding: "32px 28px",
        boxSizing: "border-box",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    title: {
        margin: 0,
        fontSize: "24px",
        fontWeight: "700",
        letterSpacing: "-0.5px",
        color: "#ffffff",
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    addBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        color: "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "10px",
        padding: "8px 15px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.35)",
        transition: "all 0.2s ease",
    },
    logoutBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        color: "#cbd5e1",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "10px",
        width: "36px",
        height: "36px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    listContainer: {
        marginTop: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minHeight: "180px",
    },
    contactItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        transition: "all 0.2s ease",
    },
    contactInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    contactName: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#f8fafc",
    },
    contactPhone: {
        display: "flex",
        alignItems: "center",
        fontSize: "13px",
        color: "#94a3b8",
    },
    contactActions: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    editBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        color: "#60a5fa",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    deleteBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        color: "#f87171",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    pagination: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        marginTop: "20px",
        paddingTop: "16px",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
    arrowBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        color: "#ffffff",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    pageInfo: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#94a3b8",
    },
    emptyText: {
        textAlign: "center",
        padding: "40px 10px",
        color: "#94a3b8",
        fontSize: "14px",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
    },
    modalCard: {
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
        padding: "26px",
        boxSizing: "border-box",
    },
    modalTitle: {
        margin: "0 0 18px 0",
        fontSize: "18px",
        fontWeight: "700",
        color: "#ffffff",
    },
    errorBox: {
        padding: "10px",
        marginBottom: "14px",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        border: "1px solid rgba(239, 68, 68, 0.45)",
        borderRadius: "8px",
        color: "#fca5a5",
        fontSize: "13px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.07)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
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
        padding: "12px 14px 12px 42px",
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#ffffff",
        fontSize: "14px",
        boxSizing: "border-box",
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "10px",
    },
    cancelBtn: {
        padding: "9px 18px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        color: "#cbd5e1",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    saveBtn: {
        padding: "9px 20px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.35)",
        transition: "all 0.2s ease",
    },
};
