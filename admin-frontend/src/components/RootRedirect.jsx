import { Navigate } from 'react-router-dom';

const RootRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/teacher/dashboard'} replace />;
};

export default RootRedirect;