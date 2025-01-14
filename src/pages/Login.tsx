import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Layout, Form, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { checkProjectExists } from '../services/linearClient';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';
import { LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [form] = Form.useForm();
  const defaultTeamId = import.meta.env.VITE_TEAM_ID || '';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (defaultTeamId) {
      form.setFieldsValue({ projectId: defaultTeamId });
    }
  }, [defaultTeamId, form]);

  const handleSubmit = async (values: { projectId: string }) => {
    setLoading(true);
    setError(null);
    
    // Eğer girilen ID, env'deki ID ile aynıysa projects sayfasına yönlendir
    if (values.projectId === defaultTeamId) {
      localStorage.setItem('projectAccess', values.projectId);
      navigate('/projects');
      return;
    }

    // Değilse normal kontrol yap ve proje detayına yönlendir
    try {
      const exists = await checkProjectExists(values.projectId);
      if (exists) {
        localStorage.setItem('projectAccess', values.projectId);
        navigate(`/projects/${values.projectId}`);
      } else {
        setError(t('common.error.project_not_found'));
      }
    } catch (error) {
      setError(t('common.error.failed_verify'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('login.title')}</title>
      </Helmet>

      <Layout style={{
        minHeight: '100%',
        height: '100vh',
        background: isDarkMode ? '#0A0A0A' : '#fff',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          height: '100vh',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Sol Taraf - Login Formu */}
          <div style={{
            padding: isMobile ? '24px' : '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ 
              maxWidth: isMobile ? '100%' : '400px', 
              width: '100%', 
              margin: '0 auto' 
            }}>
              <Title level={1} style={{ 
                fontSize: isMobile ? '32px' : '48px',
                marginBottom: '12px',
                color: isDarkMode ? '#fff' : '#000'
              }}>
                {t('login.welcome')}
              </Title>
              <Text style={{ 
                fontSize: isMobile ? '14px' : '16px',
                color: isDarkMode ? '#999' : '#666',
                display: 'block',
                marginBottom: isMobile ? '24px' : '40px'
              }}>
                {t('login.description')}
              </Text>

              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                requiredMark={false}
                initialValues={{ projectId: defaultTeamId }}
              >
                <Form.Item
                  name="projectId"
                  rules={[{ required: true, message: t('common.error.project_id_missing') }]}
                >
                  <Input
                    placeholder={t('login.form.project_id_placeholder')}
                    size="large"
                    style={{
                      height: isMobile ? '44px' : '50px',
                      borderRadius: '8px',
                      background: isDarkMode ? '#1A1A1A' : '#fff',
                      borderColor: isDarkMode ? '#333' : '#E5E5E5',
                      fontSize: isMobile ? '14px' : '16px'
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: error ? '16px' : '0' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    style={{
                      height: isMobile ? '44px' : '50px',
                      borderRadius: '8px',
                      background: '#0066FF',
                      fontSize: isMobile ? '14px' : '16px',
                      border: 'none'
                    }}
                    icon={loading && <LoadingOutlined />}
                  >
                    {t('login.form.submit')}
                  </Button>
                </Form.Item>

                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                )}
              </Form>
            </div>
          </div>

          {/* Sağ Taraf - Quote (Sadece masaüstünde görünür) */}
          {!isMobile && (
            <div style={{
              background: '#0066FF',
              padding: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <div style={{ maxWidth: '500px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '24px'
                }}>
                  "
                </div>
                <Title level={1} style={{ 
                  color: '#fff',
                  fontSize: '64px',
                  lineHeight: '1.2',
                  marginBottom: '32px'
                }}>
                  {t('login.quote.title')}
                </Title>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  display: 'block',
                  marginBottom: '40px'
                }}>
                  {t('login.quote.description')}
                </Text>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Login;
