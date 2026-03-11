import api from "./api";

export interface Experience {
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

const experienceService = {
  addExperience: async (experience: Experience) => {
    try {
      // Convert date strings to ISO 8601 format and filter out undefined values
      const exp: any = {
        jobTitle: experience.jobTitle,
        companyName: experience.companyName,
        location: experience.location || "",
      };
      if (experience.startDate) exp.startDate = new Date(experience.startDate).toISOString();
      if (experience.endDate) exp.endDate = new Date(experience.endDate).toISOString();
      if (experience.description) exp.description = experience.description;
      
      const res = await api.post("/profile/experiences", exp);
      return res;
    } catch (error) {
      console.error("Failed to add experience:", error);
      throw error;
    }
  },

  updateExperience: async (id: string, experience: Experience) => {
    try {
      // Convert date strings to ISO 8601 format and filter out undefined values
      const exp: any = {
        jobTitle: experience.jobTitle,
        companyName: experience.companyName,
        location: experience.location || "",
      };
      if (experience.startDate) exp.startDate = new Date(experience.startDate).toISOString();
      if (experience.endDate) exp.endDate = new Date(experience.endDate).toISOString();
      if (experience.description) exp.description = experience.description;
      
      const res = await api.put(`/profile/experiences/${id}`, exp);
      return res;
    } catch (error) {
      console.error("Failed to update experience:", error);
      throw error;
    }
  },

  deleteExperience: async (id: string) => {
    try {
      const res = await api.delete(`/profile/experiences/${id}`);
      return res;
    } catch (error) {
      console.error("Failed to delete experience:", error);
      throw error;
    }
  },
};

export default experienceService;
