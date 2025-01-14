import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const projectId = localStorage.getItem('projectAccess');
  const defaultTeamId = import.meta.env.VITE_TEAM_ID || '';
  const location = useLocation();

  // Eğer hiç giriş yapılmamışsa login'e yönlendir
  if (!projectId) {
    return <Navigate to="/login" replace />;
  }

  // VITE_TEAM_ID ile giriş yapılmışsa tüm sayfalara erişim ver
  if (projectId === defaultTeamId) {
    return <>{children}</>;
  }

  // Projects sayfasına erişim kontrolü
  if (location.pathname === '/projects') {
    // VITE_TEAM_ID ile giriş yapılmamışsa projenin detayına yönlendir
    return <Navigate to={`/projects/${projectId}`} replace />;
  }

  // Proje detay sayfası için kontrol
  if (location.pathname.startsWith('/projects/')) {
    const urlProjectId = location.pathname.split('/')[2];
    // Eğer URL'deki proje ID'si ile giriş yapılan ID eşleşmiyorsa login'e yönlendir
    if (urlProjectId !== projectId) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
