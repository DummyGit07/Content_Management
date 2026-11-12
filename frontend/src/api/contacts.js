const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        const errorMessage = data.detail || "Something went wrong";
        throw new Error(errorMessage);
    }
    return data;
}

export async function fetchContacts(token) {
    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

export async function addContact(token, { name, number }) {
    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, number }),
    });
    return handleResponse(response);
}

export async function updateContact(token, contactId, { name, number }) {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, number }),
    });
    return handleResponse(response);
}

export async function deleteContact(token, contactId) {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

