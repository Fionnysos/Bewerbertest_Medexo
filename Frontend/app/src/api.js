/**
 * ============================================================
 * API LAYER
 *
 * This file centralizes all HTTP requests to the backend.
 * Frontend components never call fetch() directly.
 * ============================================================
 */

// Base URL for the backend API
// Uses environment variable if available, otherwise falls back
// to local development backend.
const API_BASE
  = import.meta.env.VITE_API_BASE || 'http://localhost:4001/v1'

/**
 * Generic HTTP request helper.
 * Wraps the native fetch API and handles:
 * - base URL
 * - JSON headers
 * - error handling
 */
async function request (path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  // Read response body as text first
  // (allows handling empty responses safely)
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  // Throw error for non-2xx responses
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`)
  }

  return data
}

/**
 * ============================================================
 * API METHODS
 *
 * Each method maps to a backend REST endpoint.
 * ============================================================
 */

export const api = {
  // Fetch all users
  listUsers: () => request('/users'),

  // Create a new user
  createUser: payload =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Update an existing user
  updateUser: (id, payload) =>
    request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Block a user
  blockUser: id =>
    request(`/users/${id}/block`, {
      method: 'PATCH',
    }),

  // Unblock a user
  unblockUser: id =>
    request(`/users/${id}/unblock`, {
      method: 'PATCH',
    }),

  // Trigger CSV import on backend
  importCsv: () =>
    request('/users/import', {
      method: 'POST',
    }),
}
