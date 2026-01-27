import axios from 'axios';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api/v1';

// Create Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'حدث خطأ غير متوقع';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

// ===========================
// Offers API
// ===========================
export const offersApi = {
    // Get offers list with filters
    list: (params = {}) => {
        const { page = 1, limit = 12, category, city, tags, sort } = params;
        const queryParams = new URLSearchParams();

        queryParams.set('page', page);
        queryParams.set('limit', limit);
        if (category) queryParams.set('category', category);
        if (city) queryParams.set('city', city);
        if (tags?.length) queryParams.set('tags', tags.join(','));
        if (sort) queryParams.set('sort', sort);

        return api.get(`/offers?${queryParams.toString()}`);
    },

    // Get single offer by slug
    getBySlug: (slug) => api.get(`/offers/${slug}`),

    // Get featured offers
    getFeatured: (limit = 4) => api.get(`/offers?limit=${limit}&isActive=true`),

    // Get categories
    categories: () => api.get('/categories'),
};

// ===========================
// Blog API
// ===========================
export const blogApi = {
    // Get blog posts list
    list: (params = {}) => {
        const { page = 1, limit = 10, q } = params;
        const queryParams = new URLSearchParams();

        queryParams.set('page', page);
        queryParams.set('limit', limit);
        if (q) queryParams.set('q', q);

        return api.get(`/blog?${queryParams.toString()}`);
    },

    // Get latest blog posts
    latest: (limit = 3) => api.get(`/blog/latest?limit=${limit}`),

    // Get single post by slug
    getBySlug: (slug) => api.get(`/blog/${slug}`),
};

// ===========================
// Branches API
// ===========================
export const branchesApi = {
    // Get all branches
    list: () => api.get('/branches'),
};

// ===========================
// Leads API
// ===========================
export const leadsApi = {
    // Create a new lead
    create: (data) => api.post('/leads', data),
};

// ===========================
// Cities API
// ===========================
export const citiesApi = {
    // Get all active cities
    list: () => api.get('/cities?isActive=true'),
};

// Export default instance
export default api;
