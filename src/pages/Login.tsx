import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { checkProjectExists } from '../services/linearClient';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const isMobile = window.innerWidth <= 768;

  const handleLogin = async () => {
    if (!projectId.trim()) {
      message.error(t('common.error.project_id_missing'));
      return;
    }

    setLoading(true);
    try {
      if (projectId === import.meta.env.VITE_TEAM_ID) {
        localStorage.setItem('projectAccess', 'all');
        message.success(t('common.success.login_full_access'));
        navigate('/projects');
        return;
      }

      const exists = await checkProjectExists(projectId);
      if (exists) {
        localStorage.setItem('projectAccess', projectId);
        message.success(t('common.success.login'));
        navigate('/projects');
      } else {
        message.error(t('common.error.project_not_found'));
      }
    } catch (error) {
      console.error('Error verifying project access:', error);
      message.error(t('common.error.failed_verify'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('login.title')}</title>
        <link rel="icon" type="image/png" href="/linear-logo.png" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '16px' : '24px',
        background: isDarkMode ? '#141414' : '#f0f2f5'
      }}>
        <Card style={{
          width: isMobile ? '100%' : '400px',
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <Title level={2} style={{ 
              marginBottom: 0,
              fontSize: isMobile ? '24px' : '28px',
              color: isDarkMode ? '#fff' : undefined 
            }}>
              Linear View
            </Title>
            
            <Text type="secondary" style={{ 
              display: 'block',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              {t('login.description')}
            </Text>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Input
                placeholder={t('login.form.project_id_placeholder')}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                onPressEnter={handleLogin}
                size={isMobile ? 'middle' : 'large'}
                style={{ width: '100%' }}
              />

              <Button
                type="primary"
                onClick={handleLogin}
                loading={loading}
                size={isMobile ? 'middle' : 'large'}
                style={{ width: '100%' }}
              >
                {t('login.form.submit')}
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    </>
  );
};

export default Login;
