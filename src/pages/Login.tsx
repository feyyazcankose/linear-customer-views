import { useState } from 'react';
import { Button, Form, Input, Typography, theme, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BugOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { checkProjectExists } from '../services/linearClient';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const onFinish = async (values: { projectId: string }) => {
    setLoading(true);
    try {
      if (values.projectId === import.meta.env.VITE_TEAM_ID) {
        localStorage.setItem('projectAccess', 'all');
        message.success(t('common.success.login_full_access'));
        navigate('/projects');
        return;
      }

      const exists = await checkProjectExists(values.projectId);
      if (exists) {
        localStorage.setItem('projectAccess', values.projectId);
        message.success(t('common.success.login'));
        navigate('/projects');
      } else {
        message.error(t('common.error.project_not_found'));
      }
    } catch (error) {
      console.error('Error:', error);
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

      <div
        style={{
          display: 'flex',
          minHeight: '100vh', 
          background: isDarkMode ? '#141414' : '#fff'
        }}
      >
        {/* Sol taraf - Görsel */}
        <div style={{ 
          flex: '1',
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(https://images.unsplash.com/photo-1579403124614-197f69d8187b?q=80&w=2564&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1
          }} />
          
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff' }}>
            <BugOutlined style={{ fontSize: '64px', marginBottom: '24px' }} />
            <Title level={2} style={{ color: '#fff', marginBottom: '16px', margin: 0 }}>
              Linear View
            </Title>
            <Text style={{ fontSize: '16px', opacity: 0.8 }}>
              Track, manage, and resolve issues efficiently
            </Text>
          </div>
        </div>

        {/* Sağ taraf - Login formu */}
        <div style={{ 
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 96px',
          background: isDarkMode ? '#141414' : '#fff'
        }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <Title level={3} style={{ marginBottom: '8px', color: isDarkMode ? '#fff' : '#111' }}>
              {t('login.title')}
            </Title>
            <Text style={{ 
              display: 'block', 
              marginBottom: '32px',
              fontSize: '16px',
              color: isDarkMode ? '#999' : '#666'
            }}>
              {t('login.description')}
            </Text>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="projectId"
                rules={[
                  { required: true, message: t('login.form.project_id_placeholder') },
                  { min: 3, message: t('login.form.project_id_min_length') }
                ]}
              >
                <Input.Password
                  placeholder={t('login.form.project_id_placeholder')}
                  style={{ 
                    height: '50px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: isDarkMode ? '#1f1f1f' : '#fff',
                    border: `1px solid ${isDarkMode ? '#303030' : '#ddd'}`,
                    color: isDarkMode ? '#fff' : undefined
                  }}
                  iconRender={(visible) => (
                    <div style={{ color: isDarkMode ? '#fff' : undefined }}>
                      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </div>
                  )}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '12px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  loading={loading}
                  style={{ 
                    height: '50px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                >
                  {t('login.form.submit')}
                </Button>
              </Form.Item>

              
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
