import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Projects from './pages/Projects';
import ProjectIssues from './pages/ProjectIssues';
import Login from './pages/Login';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';

const AppContent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0066FF',
        },
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}
    >
      <Router>
        <Routes>
          {/* Public route */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute>
                <Login />
              </ProtectedRoute>
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute requireAll>
                <>
                  <Header />
                  <Projects />
                </>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:projectId/issues" 
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <ProjectIssues />
                </>
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
