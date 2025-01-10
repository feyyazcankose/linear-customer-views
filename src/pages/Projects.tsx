import { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Space, Input, Layout, message } from 'antd';
import { SearchOutlined, BugOutlined } from '@ant-design/icons';
import { getProjects } from '../services/linearClient';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const { Title } = Typography;

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      if (data?.nodes) {
        setProjects(data.nodes);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      message.error('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Layout.Content style={{ 
        padding: '24px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        background: '#fff'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>Projects</Title>
          
          <Input
            placeholder="Search projects"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />

          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={filteredProjects}
            renderItem={project => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => navigate(`/project/${project.id}/issues`)}
                  style={{ 
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>{project.name}</Title>
                  </div>
                  <div style={{ 
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: 16,
                    minHeight: '42px'
                  }}>
                    <ReactMarkdown>{project.description || 'No description available'}</ReactMarkdown>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    <BugOutlined style={{ marginRight: 8 }} />
                    View Issues
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Space>
      </Layout.Content>
    </Layout>
  );
}
