const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4001/v1";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  listUsers: () => request("/users"),
  createUser: (payload) =>
    request("/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  blockUser: (id) => request(`/users/${id}/block`, { method: "PATCH" }),
  unblockUser: (id) => request(`/users/${id}/unblock`, { method: "PATCH" }),
  importCsv: () => request("/users/import", { method: "POST" }),
};
