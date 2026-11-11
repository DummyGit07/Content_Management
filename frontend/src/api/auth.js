const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Helper to handle response and errors
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        // FastAPI returns errors under "detail"
        const errorMessage = data.detail || "Something went wrong";
        throw new Error(errorMessage);
    }
    return data;
}

// 1. Register User
export async function registerUser(userName, userPassword) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_name: userName,
            user_password: userPassword,
        }),
    });
    return handleResponse(response);
}

// 2. Login User
export async function loginUser(userName, userPassword) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_name: userName,
            user_password: userPassword,
        }),
    });
    return handleResponse(response);
}

// 3. Get Current User Profile (for page reloads)
export async function fetchCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}