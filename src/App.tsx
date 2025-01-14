import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Projects from "./pages/Projects"; // Assuming this is the correct import
import ProjectIssues from "./pages/ProjectIssues"; // Assuming this is the correct import
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const AppContent = () => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0066FF",
        },
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <div
          style={{
            minHeight: "100vh",
            position: "relative",
            // paddingBottom: "60px",
            background: isDarkMode ? "#141414" : "#fff",
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {(() => {
                    const projectAccess = localStorage.getItem('projectAccess');
                    const defaultTeamId = import.meta.env.VITE_TEAM_ID || '';
                    
                    // VITE_TEAM_ID ile giriş yapılmışsa projects'e git
                    if (projectAccess === defaultTeamId) {
                      return <Navigate to="/projects" replace />;
                    }
                    
                    // Başka bir ID ile giriş yapılmışsa o projenin detayına git
                    if (projectAccess) {
                      return <Navigate to={`/projects/${projectAccess}`} replace />;
                    }
                    
                    // Giriş yapılmamışsa login'e git
                    return <Navigate to="/login" replace />;
                  })()}
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Header />
                  <Projects />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <Header />
                  <ProjectIssues />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
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
