import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = role === 'admin' 
    ? localStorage.getItem('token')
    : localStorage.getItem('userToken');

  if (!token) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/'} />;
  }

  return children;
};

export default ProtectedRoute; 