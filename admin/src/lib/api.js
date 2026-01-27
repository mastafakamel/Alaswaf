import { clearToken, getToken } from "./auth";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/v1";

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseJsonSafe(res);

  if (res.status === 401) {
    clearToken();
    if (!location.pathname.startsWith("/login")) {
      location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  // Admin Auth
  adminLogin: (payload) => request("/admin/login", { method: "POST", body: payload, auth: false }),
  adminMe: () => request("/admin/me", { method: "GET" }),

  // Admin Offers
  adminOffers: (query = "") => request(`/admin/offers${query}`, { method: "GET" }),
  adminOfferToggleActive: (id) => request(`/admin/offers/${id}/toggle-active`, { method: "PATCH" }),
  adminOfferDuplicate: (id) => request(`/admin/offers/${id}/duplicate`, { method: "POST" }),
  adminOfferFeature: (id, featured) => request(`/admin/offers/${id}/feature`, { method: "PATCH", body: { featured } }),
  adminOfferById: (id) => request(`/admin/offers/${id}`, { method: "GET" }),
  adminCreateOffer: (payload) => request(`/admin/offers`, { method: "POST", body: payload }),
  adminUpdateOffer: (id, payload) => request(`/admin/offers/${id}`, { method: "PUT", body: payload }),
  adminDeleteOffer: (id) => request(`/admin/offers/${id}`, { method: "DELETE" }),

  // Offer Images
  adminAddOfferImage: (offerId, payload) => request(`/admin/offers/${offerId}/images`, { method: "POST", body: payload }),
  adminRemoveOfferImage: (offerId, imageId) => request(`/admin/offers/${offerId}/images/${imageId}`, { method: "DELETE" }),
  adminReorderOfferImages: (offerId, ids) => request(`/admin/offers/${offerId}/images/reorder`, { method: "PATCH", body: { ids } }),

  // Admin Tags
  adminTags: (query = "") => request(`/admin/tags${query}`, { method: "GET" }),
  adminCreateTag: (payload) => request(`/admin/tags`, { method: "POST", body: payload }),
  adminUpdateTag: (id, payload) => request(`/admin/tags/${id}`, { method: "PUT", body: payload }),
  adminDeleteTag: (id) => request(`/admin/tags/${id}`, { method: "DELETE" }),

  // Admin Cities
  adminCities: (query = "") => request(`/admin/cities${query}`, { method: "GET" }),
  adminCityById: (id) => request(`/admin/cities/${id}`, { method: "GET" }),
  adminCreateCity: (payload) => request(`/admin/cities`, { method: "POST", body: payload }),
  adminUpdateCity: (id, payload) => request(`/admin/cities/${id}`, { method: "PUT", body: payload }),
  adminDeleteCity: (id) => request(`/admin/cities/${id}`, { method: "DELETE" }),

  // Admin Categories
  adminCategories: () => request(`/admin/categories`, { method: "GET" }),
  adminCategoryById: (id) => request(`/admin/categories/${id}`, { method: "GET" }),
  adminCreateCategory: (payload) => request(`/admin/categories`, { method: "POST", body: payload }),
  adminUpdateCategory: (id, payload) => request(`/admin/categories/${id}`, { method: "PUT", body: payload }),
  adminDeleteCategory: (id) => request(`/admin/categories/${id}`, { method: "DELETE" }),
  adminCategoryToggleActive: (id) => request(`/admin/categories/${id}/toggle-active`, { method: "PATCH" }),

  // Admin Branches
  adminBranches: () => request(`/admin/branches`, { method: "GET" }),
  adminCreateBranch: (payload) => request(`/admin/branches`, { method: "POST", body: payload }),
  adminUpdateBranch: (id, payload) => request(`/admin/branches/${id}`, { method: "PUT", body: payload }),
  adminDeleteBranch: (id) => request(`/admin/branches/${id}`, { method: "DELETE" }),

  // Branch Phones
  adminAddBranchPhone: (branchId, payload) => request(`/admin/branches/${branchId}/phones`, { method: "POST", body: payload }),
  adminUpdateBranchPhone: (branchId, phoneId, payload) => request(`/admin/branches/${branchId}/phones/${phoneId}`, { method: "PUT", body: payload }),
  adminDeleteBranchPhone: (branchId, phoneId) => request(`/admin/branches/${branchId}/phones/${phoneId}`, { method: "DELETE" }),
  adminReorderBranchPhones: (branchId, ids) => request(`/admin/branches/${branchId}/phones/reorder`, { method: "PATCH", body: { ids } }),

  // Admin Leads
  adminLeads: (query = "") => request(`/admin/leads${query}`, { method: "GET" }),
  adminUpdateLead: (id, payload) => request(`/admin/leads/${id}`, { method: "PUT", body: payload }),
  adminDeleteLead: (id) => request(`/admin/leads/${id}`, { method: "DELETE" }),

  // Admin Blog
  adminBlogPosts: (query = "") => request(`/admin/blog${query}`, { method: "GET" }),
  adminBlogPostById: (id) => request(`/admin/blog/${id}`, { method: "GET" }),
  adminCreateBlogPost: (payload) => request(`/admin/blog`, { method: "POST", body: payload }),
  adminUpdateBlogPost: (id, payload) => request(`/admin/blog/${id}`, { method: "PUT", body: payload }),
  adminDeleteBlogPost: (id) => request(`/admin/blog/${id}`, { method: "DELETE" }),
  adminBlogPostTogglePublish: (id) => request(`/admin/blog/${id}/toggle-publish`, { method: "PATCH" }),

  // Image Upload
  adminUploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // We can't use the standard request() helper because it's hardcoded for JSON
    const token = getToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api/v1";
    return fetch(`${BASE}/admin/upload`, {
      method: "POST",
      headers,
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      return data;
    });
  },
};
