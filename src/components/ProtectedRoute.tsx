import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAll?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAll = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectAccess = localStorage.getItem('projectAccess');

  useEffect(() => {
    // Eğer giriş yapılmamışsa
    if (!projectAccess) {
      navigate('/login', { replace: true });
      return;
    }

    // Eğer tüm projelere erişim gerekiyorsa ve kullanıcının bu yetkisi yoksa
    if (requireAll && projectAccess !== 'all') {
      navigate('/login', { replace: true });
      return;
    }

    // Eğer belirli bir projeye erişim kontrol ediliyorsa
    if (!requireAll && projectAccess !== 'all') {
      const projectId = location.pathname.split('/')[2];
      if (projectId && projectId !== projectAccess) {
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, projectAccess, requireAll, navigate]);

  // Login sayfasında değilsek ve giriş yapılmamışsa
  if (!projectAccess && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Giriş yapılmışsa ve login sayfasındaysak
  if (projectAccess && location.pathname === '/login') {
    if (projectAccess === 'all') {
      return <Navigate to="/projects" replace />;
    } else {
      return <Navigate to={`/project/${projectAccess}/issues`} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
