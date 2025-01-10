import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import Footer from './components/Footer';
import Login from './pages/Login';
import Projects from './pages/Projects';
import ProjectIssues from './pages/ProjectIssues';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerRequest from './pages/CustomerRequest';

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
      <BrowserRouter>
        <div style={{ minHeight: '100vh', position: 'relative', paddingBottom: '60px', background: isDarkMode ? '#141414' : '#fff' }}>
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
                    <Footer />
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
                    <Footer />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project/:projectId/request" 
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <CustomerRequest />
                    <Footer />
                  </>
                </ProtectedRoute>
              } 
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
          </Routes>
       
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
};

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
