import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Table, Typography, Spin, Space, Tag, Modal, Layout, Row, Col, Card, Timeline, Input, Select, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CalendarOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectIssues } from '../services/linearClient';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import useDebounce from '../hooks/useDebounce';

const { Title, Text } = Typography;

interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
}

interface Issue {
  id: string;
  title: string;
  description?: string;
  priority: number;
  state: {
    name: string;
    type: string;
    color: string;
  };
  labels?: {
    nodes: Array<{
      name: string;
      color: string;
    }>;
  };
  projectMilestone?: ProjectMilestone;
  createdAt: string;
  updatedAt: string;
}

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  state: string;
  issues?: {
    nodes: Issue[];
  };
  projectMilestones?: {
    nodes: ProjectMilestone[];
  };
}

const ProjectIssues: FC = () => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const debouncedSearchText = useDebounce(searchText, 300);
  const debouncedLabels = useDebounce(selectedLabels, 300);
  const debouncedStates = useDebounce(selectedStates, 300);

  useEffect(() => {
    fetchProjectIssues();
  }, [projectId]);

  const fetchProjectIssues = async () => {
    if (!projectId) {
      message.error('Project ID is missing');
      return;
    }

    try {
      const data = await getProjectIssues(projectId);
      console.log('Fetched project data:', data);
      setProjectData(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      message.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const showIssueDetails = (record: Issue) => {
    setSelectedIssue(record);
    setIsModalVisible(true);
  };

  const priorityMap = {
    0: { text: 'No Priority', color: '#6B7280' },
    1: { text: 'High', color: '#EF4444' },
    2: { text: 'Medium', color: '#F59E0B' },
    3: { text: 'Low', color: '#10B981' },
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredIssues = projectData?.issues?.nodes.filter(issue => {
    if (debouncedSearchText && !issue.title.toLowerCase().includes(debouncedSearchText.toLowerCase())) {
      return false;
    }

    if (debouncedLabels.length > 0 && !issue.labels?.nodes.some(label => 
      debouncedLabels.includes(label.name)
    )) {
      return false;
    }

    if (debouncedStates.length > 0 && !debouncedStates.includes(issue.state.name)) {
      return false;
    }

    if (selectedMilestone !== 'all' && (!issue.projectMilestone || issue.projectMilestone.id !== selectedMilestone)) {
      return false;
    }

    return true;
  }) || [];

  const columns: ColumnsType<Issue> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Issue) => (
        <a onClick={() => showIssueDetails(record)} style={{ color: isDarkMode ? '#1890ff' : '#1677ff' }}>
          {text}
        </a>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => (
        <Tag color={priorityMap[priority as keyof typeof priorityMap]?.color}>
          {priorityMap[priority as keyof typeof priorityMap]?.text}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: ['state', 'name'],
      key: 'status',
      render: (text: string, record: Issue) => (
        <Tag color={record.state.color}>{text}</Tag>
      ),
    },
    {
      title: 'Milestone',
      key: 'milestone',
      render: (_, record: Issue) => 
        record.projectMilestone && (
          <Tag color="blue">{record.projectMilestone.name}</Tag>
        ),
    },
    {
      title: 'Labels',
      dataIndex: 'labels',
      key: 'labels',
      render: (labels?: { nodes: Array<{ name: string; color: string }> }) => (
        <Space size={[0, 8]} wrap>
          {labels?.nodes?.map((label, index) => (
            <Tag key={index} color={label.color}>
              {label.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{projectData?.name ? `${projectData.name} Issues` : 'Project Issues'} - Linear View</title>
      </Helmet>

      <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#141414' : '#fff' }}>
        <div style={{ padding: '24px' }}>
          <Row gutter={24}>
            <Col span={16}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={2} style={{ margin: 0, color: isDarkMode ? '#fff' : undefined }}>
                    {projectData?.name || 'Project'} Issues
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/project/${projectId}/request`)}
                  >
                    Create Customer Request
                  </Button>
                </div>

                <Space wrap>
                  <Input
                    placeholder="Search issues"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Select
                    mode="multiple"
                    placeholder="Filter by state"
                    value={selectedStates}
                    onChange={setSelectedStates}
                    style={{ width: 200 }}
                    options={Array.from(
                      new Set(projectData?.issues?.nodes.map(issue => issue.state.name))
                    ).map(state => ({
                      label: state,
                      value: state
                    }))}
                  />
                  <Select
                    mode="multiple"
                    placeholder="Filter by label"
                    value={selectedLabels}
                    onChange={setSelectedLabels}
                    style={{ width: 200 }}
                    options={Array.from(
                      new Set(projectData?.issues?.nodes.flatMap(issue => 
                        issue.labels?.nodes.map(label => label.name) || []
                      ))
                    ).map(label => ({
                      label,
                      value: label
                    }))}
                  />
                </Space>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table 
                    columns={columns} 
                    dataSource={filteredIssues} 
                    rowKey="id"
                    style={{
                      background: isDarkMode ? '#1f1f1f' : '#fff',
                      borderRadius: '8px',
                    }}
                  />
                )}
              </Space>
            </Col>

            <Col span={8}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Project Timeline</span>
                  </Space>
                }
                style={{
                  background: isDarkMode ? '#1f1f1f' : '#fff',
                  position: 'sticky',
                  top: 24,
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Project Duration</Text>
                    <div style={{ marginTop: 8 }}>
                      {projectData?.startDate && (
                        <Tag color="blue">
                          Start: {formatDate(projectData.startDate)}
                        </Tag>
                      )}
                      {projectData?.targetDate && (
                        <Tag color="orange">
                          Target: {formatDate(projectData.targetDate)}
                        </Tag>
                      )}
                    </div>
                  </div>

                  {projectData?.description && (
                    <div>
                      <Text type="secondary">Description</Text>
                      <div style={{ marginTop: 8 }}>
                        <ReactMarkdown>{projectData.description}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div>
                    <Text strong>Milestones</Text>
                    <Timeline style={{ marginTop: 8 }}>
                      <Timeline.Item>
                        <div 
                          onClick={() => setSelectedMilestone('all')}
                          style={{ 
                            cursor: 'pointer',
                            padding: '8px',
                            background: selectedMilestone === 'all'
                              ? (isDarkMode ? '#2a2a2a' : '#f0f0f0') 
                              : 'transparent',
                            borderRadius: '4px',
                            marginBottom: '4px'
                          }}
                        >
                          <Text strong>All Issues</Text>
                        </div>
                      </Timeline.Item>
                      {[...(projectData?.projectMilestones?.nodes || [])]
                        .sort((a, b) => {
                          if (!a.targetDate) return 1;
                          if (!b.targetDate) return -1;
                          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
                        })
                        .map(milestone => (
                          <Timeline.Item key={milestone.id}>
                            <div 
                              onClick={() => setSelectedMilestone(milestone.id)}
                              style={{ 
                                cursor: 'pointer',
                                padding: '8px',
                                background: selectedMilestone === milestone.id
                                  ? (isDarkMode ? '#2a2a2a' : '#f0f0f0') 
                                  : 'transparent',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}
                            >
                              <Text strong>{milestone.name}</Text>
                              {milestone.targetDate && (
                                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                                  Target: {formatDate(milestone.targetDate)}
                                </div>
                              )}
                              {milestone.description && (
                                <div style={{ marginTop: 4, fontSize: '14px' }}>
                                  {milestone.description}
                                </div>
                              )}
                            </div>
                          </Timeline.Item>
                        ))}
                    </Timeline>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        <Modal
          title={selectedIssue?.title}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedIssue && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: isDarkMode ? '#fff' : undefined }}>Status:</Text>
                <Tag color={selectedIssue.state.color} style={{ marginLeft: 8 }}>
                  {selectedIssue.state.name}
                </Tag>
              </div>

              <div>
                <Text strong style={{ color: isDarkMode ? '#fff' : undefined }}>Priority:</Text>
                <Tag 
                  color={priorityMap[selectedIssue.priority as keyof typeof priorityMap]?.color}
                  style={{ marginLeft: 8 }}
                >
                  {priorityMap[selectedIssue.priority as keyof typeof priorityMap]?.text}
                </Tag>
              </div>

              {selectedIssue.projectMilestone && (
                <div>
                  <Text strong style={{ color: isDarkMode ? '#fff' : undefined }}>Milestone:</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {selectedIssue.projectMilestone.name}
                  </Tag>
                  {selectedIssue.projectMilestone.targetDate && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      (Target: {formatDate(selectedIssue.projectMilestone.targetDate)})
                    </Text>
                  )}
                </div>
              )}

              {selectedIssue.labels?.nodes && selectedIssue.labels.nodes.length > 0 && (
                <div>
                  <Text strong style={{ color: isDarkMode ? '#fff' : undefined }}>Labels:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Space size={[0, 8]} wrap>
                      {selectedIssue.labels.nodes.map((label, index) => (
                        <Tag key={index} color={label.color}>
                          {label.name}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              )}

              <div>
                <Text strong style={{ color: isDarkMode ? '#fff' : undefined }}>Description:</Text>
                <div 
                  style={{ 
                    marginTop: 8,
                    padding: 16,
                    background: isDarkMode ? '#141414' : '#f5f5f5',
                    borderRadius: 8,
                    color: isDarkMode ? '#fff' : undefined
                  }}
                >
                  <ReactMarkdown>{selectedIssue.description || 'No description provided.'}</ReactMarkdown>
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Created: {formatDateTime(selectedIssue.createdAt)}
                  {selectedIssue.updatedAt !== selectedIssue.createdAt && 
                    ` • Updated: ${formatDateTime(selectedIssue.updatedAt)}`
                  }
                </Text>
              </div>
            </Space>
          )}
        </Modal>
      </Layout>
    </>
  );
};

export default ProjectIssues;
