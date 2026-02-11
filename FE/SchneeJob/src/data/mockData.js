/**
 * Constants - Only static data for select dropdowns
 * All dynamic data (users, jobs, companies, etc) should come from API
 */

// Helper function to load data from localStorage or use defaults
const loadFromLocalStorage = (key, defaults) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      // If stored as array of objects with 'name' property, extract names
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        return data.map(item => item.name);
      }
      return data;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaults;
};

// Locations
export const locations = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Quảng Ninh',
  'Hơn Giang',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Remote'
];

// Industries - Load from localStorage or use defaults
const defaultIndustries = [
  'IT - Phần mềm',
  'IT - Phần cứng',
  'Tài chính - Ngân hàng',
  'Bất động sản',
  'E-commerce',
  'Marketing - Quảng cáo',
  'Xây dựng',
  'Giáo dục',
  'Y tế',
  'Lữ hành - Du lịch',
  'Sản xuất',
  'Logistics',
  'Khác'
];

export const industries = loadFromLocalStorage('industries', defaultIndustries);

// Skills - Load from localStorage or use defaults
const defaultSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'C++',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'AWS',
  'Azure',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'Terraform',
  'CI/CD',
  'Git',
  'RESTful API',
  'GraphQL',
  'Microservices',
  'Design Patterns',
  'Agile',
  'Scrum',
  'Kanban',
  'HTML',
  'CSS',
  'Sass/SCSS',
  'Tailwind CSS',
  'Bootstrap',
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'SEO',
  'Google Analytics',
  'Data Analysis',
  'Machine Learning',
  'Deep Learning',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'NumPy',
  'Tableau',
  'Power BI',
  'Excel',
  'VBA',
  'Salesforce',
  'SAP',
  'Oracle',
  'Business Analysis',
  'Project Management',
  'Product Management',
  'Negotiation',
  'Communication',
  'Leadership',
  'Team Management'
];

export const skills = loadFromLocalStorage('skills', defaultSkills);

// Job Levels
export const jobLevels = [
  'Intern',
  'Fresher/Junior',
  'Middle',
  'Senior',
  'Lead/Manager',
  'Director',
  'Executive'
];

// Job Types
export const jobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Freelance',
  'Internship'
];

// Work Modes
export const workModes = [
  'On-site',
  'Remote',
  'Hybrid'
];

// Company Sizes
export const companySizes = [
  'Dưới 50 nhân viên',
  '50-200 nhân viên',
  '200-500 nhân viên',
  '500-1000 nhân viên',
  '1000-5000 nhân viên',
  '5000-10000 nhân viên',
  'Trên 10000 nhân viên'
];

// Application Statuses
export const applicationStatuses = [
  'Pending',
  'Viewed',
  'Shortlisted',
  'Interviewing',
  'Offered',
  'Accepted',
  'Rejected',
  'Withdrawn'
];

// Experience Levels
export const experienceLevels = [
  'Dưới 1 năm',
  '1-3 năm',
  '3-5 năm',
  '5-10 năm',
  'Trên 10 năm'
];

// Education Levels - Load from localStorage or use defaults
const defaultEducationLevels = [
  'Không bằng cấp',
  'Cấp 1',
  'Cấp 2',
  'Cấp 3',
  'Cao đẳng',
  'Đại học',
  'Thạc sĩ',
  'Tiến sĩ'
];

export const educationLevels = loadFromLocalStorage('educationLevels', defaultEducationLevels);

// Genders
export const genders = [
  'Nam',
  'Nữ',
  'Khác',
  'Không muốn tiết lộ'
];

// Currencies
export const currencies = [
  { code: 'VND', symbol: '₫', name: 'Đồng Việt Nam' },
  { code: 'USD', symbol: '$', name: 'Đô la Mỹ' },
  { code: 'EUR', symbol: '€', name: 'Euro' }
];

// Salary Ranges
export const salaryRanges = [
  { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: '30 - 50 triệu', min: 30000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: 999999999 }
];

// DEPRECATED: These are kept for backwards compatibility only
// All data should come from API instead
export const users = [];
export const companies = [];
export const jobs = [];
export const applications = [];
export const reviews = [];
export const chatMessages = [];
export const conversations = [];
export const notifications = [];
export const mockCompanies = [];
export const mockJobs = [];
export const mockUsers = [];
