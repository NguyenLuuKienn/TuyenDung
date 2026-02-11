import api from './api';

const dashboardService = {
    getAdminStats: () => api.get('/api/dashboard/admin'),
    getEmployerStats: () => api.get('/api/dashboard/employer'),
};

export default dashboardService;
