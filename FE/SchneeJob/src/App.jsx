import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider } from './contexts/ChatWidgetContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import EmployerLayout from './components/layout/EmployerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Protected Routes
import EmployerProtectedRoute from './components/routes/EmployerProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import CareerAdvicePage from './pages/CareerAdvicePage';

// Job Seeker Pages
import ProfilePage from './pages/jobseeker/ProfilePage';
import ApplicationsPage from './pages/jobseeker/ApplicationsPage';
import SavedJobsPage from './pages/jobseeker/SavedJobsPage';
import ResumeBuilderPage from './pages/jobseeker/ResumeBuilderPage';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJobPage from './pages/employer/PostJobPage';
import ManageJobsPage from './pages/employer/ManageJobsPage';
import CandidatesPage from './pages/employer/CandidatesPage';
import CompanyProfilePage from './pages/employer/CompanyProfilePage';
import CompanyRegistrationPage from './pages/employer/CompanyRegistrationPage';
import PendingApprovalPage from './pages/employer/PendingApprovalPage';
import ManagePostsPage from './pages/employer/ManagePostsPage';
import CreatePostPage from './pages/employer/CreatePostPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import JobsManagement from './pages/admin/JobsManagement';
import CompaniesManagement from './pages/admin/CompaniesManagement';
import CompanyRequestsManagement from './pages/admin/CompanyRequestsManagement';
import ModerationPage from './pages/admin/ModerationPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import RolesPage from './pages/admin/RolesPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import SkillsManagement from './pages/admin/SkillsManagement';
import IndustriesManagement from './pages/admin/IndustriesManagement';
import EducationLevelsManagement from './pages/admin/EducationLevelsManagement';
import ChatWidget from './components/common/ChatWidget';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user, 'allowedRoles:', allowedRoles);

  // Wait for auth state to load from localStorage
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role?.toLowerCase())) {
    console.log('[ProtectedRoute] Role not allowed:', user?.role, 'allowed:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guest Route (only for non-authenticated users)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role?.toLowerCase() === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // Employer and job seekers stay on homepage, can access via header menu
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobListPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="career-advice" element={<CareerAdvicePage />} />

        {/* Job Seeker Pages - Inside MainLayout for Header/Footer */}
        <Route path="profile" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="applications" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <ApplicationsPage />
          </ProtectedRoute>
        } />
        <Route path="saved-jobs" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <SavedJobsPage />
          </ProtectedRoute>
        } />
        <Route path="resume-builder" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <ResumeBuilderPage />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute allowedRoles={['jobseeker', 'employer']}>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={['jobseeker', 'employer', 'admin']}>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Auth Routes - No layout */}
      <Route path="/login" element={
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      } />

      {/* Employer Registration Routes (no layout) */}
      <Route path="/employer/company/create" element={
        <ProtectedRoute allowedRoles={['employer']}>
          <CompanyRegistrationPage />
        </ProtectedRoute>
      } />
      <Route path="/employer/pending" element={
        <ProtectedRoute allowedRoles={['employer']}>
          <PendingApprovalPage />
        </ProtectedRoute>
      } />

      {/* Employer Routes - requires approved company */}
      <Route path="/employer" element={
        <EmployerProtectedRoute>
          <EmployerLayout />
        </EmployerProtectedRoute>
      }>
        <Route index element={<EmployerDashboard />} />
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="jobs" element={<ManageJobsPage />} />
        <Route path="jobs/new" element={<PostJobPage />} />
        <Route path="jobs/:id/edit" element={<PostJobPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="company" element={<CompanyProfilePage />} />
        <Route path="statistics" element={<EmployerDashboard />} />
        <Route path="posts" element={<ManagePostsPage />} />
        <Route path="posts/create" element={<CreatePostPage />} />
        <Route path="posts/:id/edit" element={<CreatePostPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="jobs" element={<JobsManagement />} />
        <Route path="companies" element={<CompaniesManagement />} />
        <Route path="company-requests" element={<CompanyRequestsManagement />} />
        <Route path="moderation" element={<ModerationPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="skills" element={<SkillsManagement />} />
        <Route path="industries" element={<IndustriesManagement />} />
        <Route path="education-levels" element={<EducationLevelsManagement />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={
        <MainLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Không tìm thấy trang</h2>
              <p className="text-gray-500 mb-6">Trang bạn đang tìm kiếm không tồn tại.</p>
              <a href="/" className="btn-primary">Về trang chủ</a>
            </div>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <JobProvider>
              <NotificationProvider>
                <ChatProvider>
                  <AppRoutes />
                  <ChatWidget />
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </ChatProvider>
              </NotificationProvider>
            </JobProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
