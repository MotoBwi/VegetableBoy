const BASE = "";

async function api(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = data?.error || `HTTP ${res.status}`;
    throw new Error(error);
  }

  return data;
}

export const authApi = {
  login: (username, password) =>
    api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api("/api/auth/me"),
  seed: (key, username, password) =>
    api("/api/auth/seed", {
      method: "POST",
      body: JSON.stringify({ key, username, password }),
    }),
};

export const productApi = {
  getAll: async () => {
    const res = await api("/api/products");
    return res.products || res;
  },
  create: (data) => api("/api/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => api(`/api/products/${id}`, { method: "DELETE" }),
  toggle: (id) => api(`/api/products/${id}/toggle`, { method: "PATCH" }),
};

export const zoneApi = {
  getAll: async () => {
    const res = await api("/api/zones");
    return res.zones || res;
  },
  create: (data) => api("/api/zones", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/zones/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => api(`/api/zones/${id}`, { method: "DELETE" }),
};

export const deliveryApi = {
  getAll: async () => {
    const res = await api("/api/delivery-persons");
    return res.persons || res;
  },
  create: (data) => api("/api/delivery-persons", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/delivery-persons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => api(`/api/delivery-persons/${id}`, { method: "DELETE" }),
  toggle: (id) => api(`/api/delivery-persons/${id}/toggle`, { method: "PATCH" }),
};

export const userApi = {
  getAll: async () => {
    const res = await api("/api/users");
    return res.users || res;
  },
  create: (data) => api("/api/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => api(`/api/users/${id}`, { method: "DELETE" }),
  toggle: (id) => api(`/api/users/${id}/toggle`, { method: "PATCH" }),
};

export const orderApi = {
  getAll: async () => {
    const res = await api("/api/orders");
    return res.orders || res;
  },
  create: (data) => api("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => api(`/api/orders/${id}`, { method: "DELETE" }),
  reassign: (id, deliveryPersonId) => api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ deliveryPersonId }) }),
};

export const priceApi = {
  getAll: () => api("/api/prices"),
  save: (prices) => api("/api/prices", { method: "POST", body: JSON.stringify({ prices }) }),
};

export const reportApi = {
  getAll: () => api("/api/reports"),
};

export const settlementApi = {
  getAll: () => api("/api/delivery-persons/settlements"),
  create: (data) => api("/api/delivery-persons/settlements", { method: "POST", body: JSON.stringify(data) }),
  remove: (id) => api(`/api/delivery-persons/settlements/${id}`, { method: "DELETE" }),
};

export const paymentApi = {
  getReport: () => api("/api/delivery-persons/payments"),
};

export const dashboardApi = {
  getStats: () => api("/api/dashboard"),
};

export const failedPaymentsApi = {
  getAll: () => api("/api/failed-payments"),
};
