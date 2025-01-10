import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Projects from './pages/Projects';
import ProjectIssues from './pages/ProjectIssues';
import Login from './pages/Login';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigProvider } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0066FF',
        },
        algorithm: []  // Dark mode kaldırıldı
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
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
