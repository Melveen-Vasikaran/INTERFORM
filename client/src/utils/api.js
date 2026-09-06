const API_BASE = '/api';

export function getAuthHeader() {
  const token = localStorage.getItem('interform_jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || 'An error occurred while processing your request.');
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// Auth APIs
export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const registerUser = (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const fetchCurrentUser = () => request('/auth/me');

// Resource APIs
export const fetchResources = (queryParams = '') => request(`/resources${queryParams ? '?' + queryParams : ''}`);
export const fetchResourceById = (id) => request(`/resources/${id}`);
export const createResource = (data) => request('/resources', { method: 'POST', body: JSON.stringify(data) });
export const updateResource = (id, data) => request(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteResource = (id) => request(`/resources/${id}`, { method: 'DELETE' });
export const fetchSmartAlternatives = (data) => request('/resources/alternatives', { method: 'POST', body: JSON.stringify(data) });

// Request APIs
export const fetchRequests = () => request('/requests');
export const submitRequest = (data) => request('/requests', { method: 'POST', body: JSON.stringify(data) });
export const approveRequest = (id, reason) => request(`/requests/${id}/approve`, { method: 'PUT', body: JSON.stringify({ approvalReason: reason }) });
export const rejectRequest = (id, reason) => request(`/requests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) });

// Booking APIs
export const fetchBookings = () => request('/bookings');
export const createBooking = (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const cancelBooking = (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' });

// Events APIs
export const fetchEvents = () => request('/events');
export const createEvent = (data) => request('/events', { method: 'POST', body: JSON.stringify(data) });
export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });

// Maintenance APIs
export const fetchMaintenance = () => request('/maintenance');
export const createMaintenance = (data) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) });

// Notifications APIs
export const fetchNotifications = () => request('/notifications');
export const markNotificationRead = (id) => request(`/notifications/${id}/read`, { method: 'PUT' });
export const markAllNotificationsRead = () => request('/notifications/read-all', { method: 'PUT' });

// Departments & Settings
export const fetchDepartments = () => request('/departments');
export const createDepartment = (data) => request('/departments', { method: 'POST', body: JSON.stringify(data) });
export const updateDepartment = (id, data) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const fetchUsers = () => request('/users');
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const uploadProfilePhoto = (imageBase64) => request('/users/profile-photo', { method: 'POST', body: JSON.stringify({ imageBase64 }) });
export const removeProfilePhoto = () => request('/users/profile-photo', { method: 'DELETE' });
export const fetchAnalytics = () => request('/analytics');
export const fetchSettings = () => request('/settings');
export const updateSettings = (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) });
export const setupInstitution = (data) => request('/institution/setup', { method: 'POST', body: JSON.stringify(data) });
export const resetDemoData = () => request('/institution/reset-demo', { method: 'POST' });

// Invitations APIs
export const fetchInvitations = () => request('/invitations');
export const inviteHod = (data) => request('/invitations', { method: 'POST', body: JSON.stringify(data) });
export const revokeInvitation = (id) => request(`/invitations/${id}/revoke`, { method: 'POST' });
export const resendInvitation = (id) => request(`/invitations/${id}/resend`, { method: 'POST' });
export const verifyInvitation = (token) => request(`/invitations/verify/${token}`);
export const acceptInvitation = (data) => request('/invitations/accept', { method: 'POST', body: JSON.stringify(data) });
