import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Features from './pages/Features';
import RootRedirect from './components/RootRedirect';
import RoleRoute from './components/RoleRoute';
import AdminLayout from './components/AdminLayout';
import TeacherLayout from './components/TeacherLayout';
import AIAssistant from './components/AIAssistant';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Courses from './pages/admin/Courses';
import Lessons from './pages/admin/Lessons';
import Signs from './pages/admin/Signs';
import AuditLogs from './pages/admin/AuditLogs';
import Profile from './pages/admin/Profile';
import Notifications from './pages/admin/Notifications';
import MyContent from './pages/admin/MyContent';
import Quizzes from './pages/admin/Quizzes';
import Enrollments from './pages/admin/Enrollments';


// Teacher pages
import TeacherLessons from './pages/teacher/Lessons';
import TeacherSigns from './pages/teacher/Signs';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherDashboard from './pages/teacher/Dashboard';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes – no login required */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/features" element={<Features />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Root redirect for authenticated users (after login) */}
        <Route path="/dashboard" element={<RootRedirect />} />

        {/* Admin only */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/courses" element={<Courses />} />
            <Route path="/admin/lessons" element={<Lessons />} />
            <Route path="/admin/signs" element={<Signs />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/my-content" element={<MyContent />} />
            <Route path="/admin/quizzes" element={<Quizzes />} />
            <Route path="/admin/enrollments" element={<Enrollments />} />
          </Route>
        </Route>

        {/* Teacher only */}
        <Route element={<RoleRoute allowedRoles={['TEACHER']} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/lessons" element={<TeacherLessons />} />
            <Route path="/teacher/signs" element={<TeacherSigns />} />
            <Route path="/teacher/my-content" element={<MyContent />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/quizzes" element={<Quizzes />} />
            <Route path="/teacher/enrollments" element={<Enrollments />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* AI Assistant – outside Routes, inside Router */}
      <AIAssistant />
    </BrowserRouter>
  );
}

export default App;