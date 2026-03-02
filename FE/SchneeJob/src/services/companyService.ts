/**
 * Company Service
 * Handles company-related operations
 */

import api from './api';

export interface Company {
  id: string;
  companyId?: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  website: string;
  logo: string;
  logoURL?: string;
  cover: string;
  coverImageURL?: string;
  description: string;
  companyDescription?: string;
  size: string;
  companySize?: string;
  address: string;
  city: string;
  country: string;
  industryId?: string;
  industry?: {
    id: string;
    name: string;
  };
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CompanyUpdateRequest {
  companyName?: string;
  companyEmail?: string;
  phoneNumber?: string;
  website?: string;
  logoURL?: string;
  coverImageURL?: string;
  companyDescription?: string;
  companySize?: string;
  address?: string;
  city?: string;
  country?: string;
  industryId?: string;
}

export interface CompanyFollow {
  id: string;
  userId: string;
  companyId: string;
  followedAt: string;
}

// Map backend company object to frontend shape
const mapCompany = (c: any): Company | null => {
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
    industryId: c.industryId || c.IndustryId,
    industry: c.industry || c.Industry,
    isVerified: c.isVerified ?? c.IsVerified ?? false,
    createdAt: c.createdAt || c.CreatedAt,
    updatedAt: c.updatedAt || c.UpdatedAt,
    raw: c,
  };
};

const companyService = {
  /**
   * Get all companies
   */
  getAll: async () => {
    try {
      const res = await api.get<Company[]>('/companies');
      const data = res.data?.data || res.data || [];
      const mapped = Array.isArray(data) ? data.map(mapCompany).filter(Boolean) : [];
      return { ...res, data: mapped };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  /**
   * Get company by ID
   */
  getById: async (id: string) => {
    try {
      const res = await api.get<Company>(`/companies/${id}`);
      const data = res.data?.data || res.data;
      const mapped = mapCompany(data);
      return { ...res, data: mapped };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: null };
      }
      throw error;
    }
  },

  /**
   * Get my company (Employer only)
   */
  getMyCompany: async () => {
    try {
      const res = await api.get<Company>('/companies/my-company');
      const data = res.data?.data || res.data;
      const mapped = mapCompany(data);
      return { ...res, data: mapped };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: null };
      }
      throw error;
    }
  },

  /**
   * Update my company (Employer only)
   */
  updateMyCompany: async (companyData: CompanyUpdateRequest) => {
    try {
      const res = await api.put<Company>('/companies/my-company', companyData);
      const data = res.data?.data || res.data;
      const mapped = mapCompany(data);
      return { ...res, data: mapped };
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  },

  /**
   * Get my company registration
   */
  getMyRegistration: async () => {
    try {
      const res = await api.get('/companyregistrations/my-registration');
      return res;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: null };
      }
      throw error;
    }
  },

  /**
   * Delete company (Admin only)
   */
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/companies/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete company ${id}:`, error);
      throw error;
    }
  },

  /**
   * Verify company (Admin only)
   */
  verify: async (id: string, isVerified: boolean) => {
    try {
      const res = await api.put(`/companies/${id}/verify`, isVerified, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res;
    } catch (error) {
      console.error(`Failed to verify company ${id}:`, error);
      throw error;
    }
  },

  /**
   * Follow a company
   */
  follow: async (companyId: string) => {
    try {
      const res = await api.post<CompanyFollow>(`/companyfollow/company-follow/${companyId}`);
      return res;
    } catch (error) {
      console.error(`Failed to follow company ${companyId}:`, error);
      throw error;
    }
  },

  /**
   * Unfollow a company
   */
  unfollow: async (companyId: string) => {
    try {
      const res = await api.delete(`/companyfollow/company-follow/${companyId}`);
      return res;
    } catch (error) {
      console.error(`Failed to unfollow company ${companyId}:`, error);
      throw error;
    }
  },

  /**
   * Get my followed companies
   */
  getMyFollowed: async () => {
    try {
      const res = await api.get<CompanyFollow[]>('/companyfollow/company-follow');
      return res;
    } catch (error) {
      console.error('Failed to fetch followed companies:', error);
      throw error;
    }
  },
};

export default companyService;
