import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor to attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// --- Authentication ---
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

// --- Documents (Combined into ONE object) ---
export const docAPI = {
  // Matches router.post("/upload", ...)
  upload: (formData: FormData) => api.post('/docs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Matches router.get("/", ...)
  getAll: () => api.get('/docs'),
  
  // Matches router.get("/:id", ...)
  getById: (id: string) => api.get(`/docs/${id}`),
  
  // Matches router.get("/public/:token", ...)
  getByToken: (token: string) => api.get(`/docs/public/${token}`),

  // Matches router.delete("/:id", ...)
  delete: (id: string) => api.delete(`/docs/${id}`),
};

// --- Signatures ---
export const sigAPI = {
  // Ensure 'signatureImage' is included in the type definition here
  save: (data: { 
    documentId: string; 
    x: number; 
    y: number; 
    page: number; 
    signatureImage?: string 
  }) => api.post('/signatures', data),

  finalize: (docId: string) => api.post(`/signatures/finalize/${docId}`),
};