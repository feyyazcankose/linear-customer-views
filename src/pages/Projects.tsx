import { useEffect, useState } from 'react';
import { Card, List, Typography, Space, Input, Layout, message, Tag } from 'antd';
import { SearchOutlined, DownOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import { getProjects } from '../services/linearClient';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';
import dayjs from 'dayjs';
import Loader from '../components/Loader';

const { Title, Text } = Typography;

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  state: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'backlog':
      return 'default';
    case 'planned':
      return 'blue';
    case 'in progress':
      return 'processing';
    case 'paused':
      return 'warning';
    case 'completed':
      return 'success';
    case 'canceled':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const { isDarkMode } = useTheme();

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

  const handleCardClick = (projectId: string) => {
    navigate(`/project/${projectId}/issues`);
  };

  const toggleDescription = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      background: isDarkMode ? '#141414' : '#fff' 
    }}>
      <Layout.Content style={{ 
        padding: '0 16px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        background: isDarkMode ? '#141414' : '#fff'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ color: isDarkMode ? '#fff' : undefined }}>
            Projects
          </Title>
          
          <Input
            placeholder="Search projects"
            prefix={<SearchOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ 
              maxWidth: 300,
              backgroundColor: isDarkMode ? '#1f1f1f' : undefined,
              borderColor: isDarkMode ? '#303030' : undefined,
              color: isDarkMode ? '#fff' : undefined
            }}
          />

          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={filteredProjects}
            renderItem={project => (
              <List.Item style={{ height: '150px' }}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(project.id)}
                  style={{ 
                    background: isDarkMode ? '#1f1f1f' : '#fff',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#303030' : '#eee'}`,
                    boxShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                  bodyStyle={{
                    padding: '16px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                    <Title level={4} style={{ 
                      margin: 0,
                      color: isDarkMode ? '#fff' : undefined,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {project.name}
                    </Title>
                    {project.description && (
                      <div 
                        onClick={(e) => toggleDescription(project.id, e)}
                        style={{ 
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {expandedCards.includes(project.id) ? (
                          <DownOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />
                        ) : (
                          <RightOutlined style={{ color: isDarkMode ? '#fff' : undefined }} />
                        )}
                      </div>
                    )}
                  </div>

                  <Space direction="vertical" size={8} style={{ flex: 1 }}>
                    <Tag color={getStatusColor(project.state)}>
                      {project.state}
                    </Tag>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: isDarkMode ? '#999' : '#666',
                      fontSize: '12px'
                    }}>
                      <CalendarOutlined style={{ fontSize: '12px' }} />
                      <Text style={{ 
                        color: isDarkMode ? '#999' : '#666',
                        margin: 0
                      }}>
                        {formatDate(project.startDate)} - {formatDate(project.targetDate)}
                      </Text>
                    </div>
                  </Space>
                  
                  {expandedCards.includes(project.id) && project.description && (
                    <div style={{ 
                      marginTop: 8,
                      color: isDarkMode ? '#999' : '#666',
                      fontSize: '14px',
                      overflow: 'auto',
                      maxHeight: '200px',
                      borderTop: `1px solid ${isDarkMode ? '#303030' : '#eee'}`,
                      paddingTop: 8
                    }}>
                      <ReactMarkdown>
                        {project.description}
                      </ReactMarkdown>
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
          />
        </Space>
      </Layout.Content>
    </Layout>
  );
}
