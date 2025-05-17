import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL + '/api',
});

// Request interceptor for adding token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// User Service
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Student Service
export const studentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
};

// Instructor Service
export const instructorService = {
  getAll: () => api.get('/instructors'),
  getById: (id) => api.get(`/instructors/${id}`),
  create: (instructorData) => api.post('/instructors', instructorData),
  update: (id, instructorData) => api.put(`/instructors/${id}`, instructorData),
  delete: (id) => api.delete(`/instructors/${id}`),
};

// Course Service
export const courseService = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Vehicle Service
export const vehicleService = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Enrollment Service
export const enrollmentService = {
  create: (enrollmentData) => api.post('/enrollments', enrollmentData),
  getByStudentId: (studentId) => api.get(`/students/${studentId}`),
  update: (id, enrollmentData) => api.put(`/enrollments/${id}`, enrollmentData),
  delete: (id) => api.delete(`/enrollments/${id}`),
};

// Lesson Service
export const lessonService = {
  create: (lessonData) => api.post('/lessons', lessonData),
  update: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  delete: (id) => api.delete(`/lessons/${id}`),
  getSchedule: (params) => api.get('/schedule', { params }),
};

// Payment Service
export const paymentService = {
  create: (paymentData) => api.post('/payments', paymentData),
};

// Exam Service
export const examService = {
  create: (examData) => api.post('/exams', examData),
  update: (id, examData) => api.put(`/exams/${id}`, examData),
};

// Dashboard Service
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

// Reports Service
export const reportService = {
  getStudents: () => api.get('/reports/students'),
  getInstructors: () => api.get('/reports/instructors'),
  getFinancial: (params) => api.get('/reports/financial', { params }),
};

export default api;
