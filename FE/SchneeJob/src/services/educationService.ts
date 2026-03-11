import api from "./api";

export interface Education {
  degree: string;
  schoolName: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

const educationService = {
  addEducation: async (education: Education) => {
    try {
      // Convert date strings to ISO 8601 format and filter out undefined values
      const edu: any = {
        degree: education.degree,
        schoolName: education.schoolName,
      };
      if (education.fieldOfStudy) edu.fieldOfStudy = education.fieldOfStudy;
      if (education.startDate) edu.startDate = new Date(education.startDate).toISOString();
      if (education.endDate) edu.endDate = new Date(education.endDate).toISOString();
      if (education.description) edu.description = education.description;
      
      const res = await api.post("/profile/educations", edu);
      return res;
    } catch (error) {
      console.error("Failed to add education:", error);
      throw error;
    }
  },

  updateEducation: async (id: string, education: Education) => {
    try {
      // Convert date strings to ISO 8601 format and filter out undefined values
      const edu: any = {
        degree: education.degree,
        schoolName: education.schoolName,
      };
      if (education.fieldOfStudy) edu.fieldOfStudy = education.fieldOfStudy;
      if (education.startDate) edu.startDate = new Date(education.startDate).toISOString();
      if (education.endDate) edu.endDate = new Date(education.endDate).toISOString();
      if (education.description) edu.description = education.description;
      
      const res = await api.put(`/profile/educations/${id}`, edu);
      return res;
    } catch (error) {
      console.error("Failed to update education:", error);
      throw error;
    }
  },

  deleteEducation: async (id: string) => {
    try {
      const res = await api.delete(`/profile/educations/${id}`);
      return res;
    } catch (error) {
      console.error("Failed to delete education:", error);
      throw error;
    }
  },
};

export default educationService;
