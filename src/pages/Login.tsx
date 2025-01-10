import { useState } from 'react';
import { Form, Input, Button, Typography, theme, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BugOutlined } from '@ant-design/icons';
import { checkProjectExists } from '../services/linearClient';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const onFinish = async (values: { projectId: string }) => {
    setLoading(true);
    try {
      const { projectId } = values;

      // Master proje ID'si kontrolü
      if (projectId === import.meta.env.VITE_TEAM_ID) {
        localStorage.setItem('projectAccess', 'all');
        message.success('Login successful');
        navigate('/projects');
      } else {
        // Normal proje ID'si kontrolü
        const exists = await checkProjectExists(projectId);
        
        if (!exists) {
          message.error('Project ID is invalid or does not exist');
          return;
        }

        localStorage.setItem('projectAccess', projectId);
        message.success('Login successful');
        navigate(`/project/${projectId}/issues`);
      }
    } catch (error) {
      message.error('Failed to verify project access');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh', 
      background: '#fff'
    }}>
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
            Linear Bug Tracker
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
        background: '#fff'
      }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Title level={3} style={{ marginBottom: '8px', color: '#111' }}>
            Welcome back
          </Title>
          <Text style={{ 
            display: 'block', 
            marginBottom: '32px',
            fontSize: '16px',
            color: '#666'
          }}>
            Enter your project ID to continue
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
                { required: true, message: 'Please input your project ID!' },
                { min: 3, message: 'Project ID must be at least 3 characters' }
              ]}
            >
              <Input 
                placeholder="Project ID"
                style={{ 
                  height: '50px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: '#fff',
                  border: '1px solid #ddd'
                }}
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
                Continue
              </Button>
            </Form.Item>

            {/* <Text style={{ fontSize: '14px', color: '#666' }}>
              Use <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {import.meta.env.VITE_TEAM_ID}
              </code> to access all projects
            </Text> */}
          </Form>
        </div>
      </div>
    </div>
  );
}
