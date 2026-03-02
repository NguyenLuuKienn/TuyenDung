/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { JobDetails } from "./pages/JobDetails";
import { Profile } from "./pages/Profile";
import { EmployerDashboard } from "./pages/EmployerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { CompanyDetails } from "./pages/CompanyDetails";
import { Companies } from "./pages/Companies";
import { PostJob } from "./pages/PostJob";
import { CompanyRegistration } from "./pages/CompanyRegistration";
import { ManageJob } from "./pages/ManageJob";
import { ManagePosts } from "./pages/ManagePosts";
import { ManageApplicants } from "./pages/ManageApplicants";
import { JobList } from "./pages/JobList";
import { CareerGuide } from "./pages/CareerGuide";
import { SavedJobs } from "./pages/SavedJobs";
import { Settings } from "./pages/Settings";
import { SalaryCalculator } from "./pages/SalaryCalculator";
import { CVBuilder } from "./pages/CVBuilder";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="jobs" element={<JobList />} />
          <Route path="career-guide" element={<CareerGuide />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="salary-calculator" element={<SalaryCalculator />} />
          <Route path="cv-builder" element={<CVBuilder />} />
          <Route path="companies" element={<Companies />} />
          <Route path="company/:id" element={<CompanyDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="employer/dashboard" element={<ProtectedRoute requiredRoles={["Employer"]}><EmployerDashboard /></ProtectedRoute>} />
          <Route path="employer/jobs/:id" element={<ProtectedRoute requiredRoles={["Employer"]}><ManageJob /></ProtectedRoute>} />
          <Route path="employer/post-job" element={<ProtectedRoute requiredRoles={["Employer"]}><PostJob /></ProtectedRoute>} />
          <Route path="employer/register-company" element={<ProtectedRoute requiredRoles={["Employer"]}><CompanyRegistration /></ProtectedRoute>} />
          <Route path="employer/posts" element={<ProtectedRoute requiredRoles={["Employer"]}><ManagePosts /></ProtectedRoute>} />
          <Route path="employer/applicants" element={<ProtectedRoute requiredRoles={["Employer"]}><ManageApplicants /></ProtectedRoute>} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
