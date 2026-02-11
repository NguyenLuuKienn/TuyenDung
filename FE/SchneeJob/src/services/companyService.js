import api from './api';

/**
 * Company Service
 * Handles company-related operations
 */
// Map backend company object to frontend shape
const mapCompany = (c) => {
  if (!c) return null;
  return {
    id: c.id || c.companyId || c.CompanyId || c.CompanyId,
    name: c.name || c.companyName || c.CompanyName || c.CompanyName,
    email: c.companyEmail || c.CompanyEmail || c.email,
    phone: c.phoneNumber || c.PhoneNumber || c.phone,
    website: c.website || c.Website,
    logo: c.logoURL || c.LogoURL || c.logo,
    cover: c.coverImageURL || c.CoverImageURL || c.cover || c.banner,
    description: c.companyDescription || c.CompanyDescription || c.description,
    size: c.companySize || c.CompanySize,
    address: c.address || c.Address,
    city: c.city || c.City,
    country: c.country || c.Country,
    createdAt: c.createdAt || c.CreatedAt,
    isVerified: c.isVerified ?? c.IsVerified ?? false,
    industryId: c.industryId || c.IndustryId || c.IndustryId,
    contactUserId: c.contactUserId || c.ContactUserId,
    raw: c,
  };
};

const companyService = {
  getAll: async () => {
    try {
      const res = await api.get('/api/companies');
      const data = res.data || [];
      res.data = Array.isArray(data) ? data.map(mapCompany) : [];
      return res;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/api/companies/${id}`);
      res.data = mapCompany(res.data);
      return res;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: null };
      }
      throw error;
    }
  },

  getMyCompany: () => api.get('/api/companies/my-company'),

  updateMyCompany: (companyData) =>
    api.put('/api/companies/my-company', companyData),

  delete: (id) => api.delete(`/api/companies/${id}`),

  verify: (id, isVerified) => api.put(`/api/companies/${id}/verify`, isVerified, {
    headers: { 'Content-Type': 'application/json' }
  }),
};

export default companyService;
