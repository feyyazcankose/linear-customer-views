import { useState, useEffect } from 'react';
import { Table, Typography, Spin, Space, Tag, Modal, Layout, Row, Col, Card, Timeline, Input, Select, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import { CalendarOutlined, SearchOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectIssues } from '../services/linearClient';
import Header from '../components/Header';
import useDebounce from '../hooks/useDebounce';
import MarkdownContent from '../components/MarkdownContent';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

interface State {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
}

interface Issue {
  id: string;
  identifier: string;
  number: number;
  title: string;
  description?: string;
  state: State;
  priority: number;
  projectMilestone?: ProjectMilestone;
  labels: {
    nodes: Label[];
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  issues: {
    nodes: Issue[];
  };
  projectMilestones: {
    nodes: ProjectMilestone[];
  };
}

const ProjectIssues = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 300);
  const debouncedLabels = useDebounce(selectedLabels, 300);
  const debouncedStates = useDebounce(selectedStates, 300);
  const debouncedMilestones = useDebounce(selectedMilestones, 300);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<Issue> = [
    {
      title: 'ID',
      key: 'identifier',
      width: 120,
      render: (_, record: Issue) => (
        <Typography.Text style={{ fontFamily: 'monospace' }}>
          {record.identifier}
        </Typography.Text>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Issue) => (
        <a onClick={() => handleIssueClick(record)}>{text}</a>
      ),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state: State) => (
        <Tag color={state.color}>
          {state.name}
        </Tag>
      ),
    },
    {
      title: 'Milestone',
      dataIndex: 'projectMilestone',
      key: 'projectMilestone',
      render: (milestone: ProjectMilestone | undefined) => {
        if (!milestone) return '-';
        return (
          <Tag>
            {milestone.name}
            {milestone.targetDate && (
              <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                {new Date(milestone.targetDate).toLocaleDateString()}
              </span>
            )}
          </Tag>
        );
      },
      filters: project?.issues.nodes
        .filter(issue => issue.projectMilestone)
        .map(issue => ({
          text: issue.projectMilestone?.name || '',
          value: issue.projectMilestone?.id || ''
        }))
        .filter((item, index, self) => 
          index === self.findIndex(t => t.value === item.value)
        ),
      onFilter: (value: Key | boolean, record: Issue) =>
        record.projectMilestone?.id === value,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => (
        <Tag color={
          priority === 0 ? 'gray' :
          priority === 1 ? 'blue' :
          priority === 2 ? 'orange' : 'red'
        }>
          P{priority}
        </Tag>
      ),
    },
    {
      title: 'Labels',
      dataIndex: 'labels',
      key: 'labels',
      render: (_: any, record: Issue) => (
        <Space>
          {record.labels.nodes.map((label: Label) => (
            <Tag key={label.id} color={label.color}>
              {label.name}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        navigate('/projects');
        return;
      }

      try {
        setLoading(true);
        const projectData = await getProjectIssues(projectId);
        if (!projectData) {
          navigate('/projects');
          return;
        }
        setProject(projectData);
        setFilteredIssues(projectData.issues.nodes);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, navigate]);

  useEffect(() => {
    if (!project) return;

    let filtered = project.issues.nodes;

    if (debouncedSearchText) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(debouncedSearchText.toLowerCase())
      );
    }

    if (debouncedLabels.length > 0) {
      filtered = filtered.filter(issue =>
        issue.labels.nodes.some(label => debouncedLabels.includes(label.name))
      );
    }

    if (debouncedStates.length > 0) {
      filtered = filtered.filter(issue =>
        debouncedStates.includes(issue.state.name)
      );
    }

    if (debouncedMilestones.length > 0) {
      filtered = filtered.filter(issue =>
        issue.projectMilestone && debouncedMilestones.includes(issue.projectMilestone.id)
      );
    }

    setFilteredIssues(filtered);
  }, [project, debouncedSearchText, debouncedLabels, debouncedStates, debouncedMilestones]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Row gutter={24}>
          <Col span={sidebarCollapsed ? 23 : 16}>
            <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={2} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project?.name}
                  </Title>
                </div>
                <Button 
                  type="text"
                  icon={sidebarCollapsed ? <LeftOutlined /> : <RightOutlined />}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
              </div>

              <Space wrap style={{ width: '100%' }}>
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
                    new Set(project?.issues.nodes.map(issue => issue.state.name))
                  ).map(state => ({
                    label: state,
                    value: state
                  }))}
                />
                <Select
                  mode="multiple"
                  placeholder="Filter by milestone"
                  value={selectedMilestones}
                  onChange={setSelectedMilestones}
                  style={{ width: 200 }}
                  options={project?.projectMilestones.nodes.map(milestone => ({
                    label: milestone.name,
                    value: milestone.id
                  }))}
                />
              </Space>

              {project?.description && (
                <Typography.Paragraph>
                  {project.description}
                </Typography.Paragraph>
              )}

              <Table
                dataSource={filteredIssues}
                columns={columns}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
              />
            </Space>
          </Col>

          {!sidebarCollapsed && (
            <Col span={8} style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
              <Card 
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Project Timeline</span>
                  </Space>
                }
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Project Duration</Text>
                    <div style={{ marginTop: 4 }}>
                      {project?.startDate && (
                        <Tag color="blue">
                          Start: {new Date(project.startDate).toLocaleDateString()}
                        </Tag>
                      )}
                      {project?.targetDate && (
                        <Tag color="orange">
                          Target: {new Date(project.targetDate).toLocaleDateString()}
                        </Tag>
                      )}
                    </div>
                  </div>

                  <div>
                    <Text strong>Milestones</Text>
                    <Timeline style={{ marginTop: 16 }}>
                      {project?.projectMilestones.nodes
                        .slice()
                        .sort((a, b) => {
                          const dateA = a.targetDate ? new Date(a.targetDate).getTime() : Number.MAX_SAFE_INTEGER;
                          const dateB = b.targetDate ? new Date(b.targetDate).getTime() : Number.MAX_SAFE_INTEGER;
                          return dateA - dateB;
                        })
                        .map((milestone: ProjectMilestone) => (
                          <Timeline.Item key={milestone.id}>
                            <div>
                              <Text strong>
                                {milestone.name}
                              </Text>
                              {milestone.targetDate && (
                                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                  Target: {new Date(milestone.targetDate).toLocaleDateString()}
                                </div>
                              )}
                              {milestone.description && (
                                <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
                                  {milestone.description}
                                </Paragraph>
                              )}
                            </div>
                          </Timeline.Item>
                        ))}
                    </Timeline>
                  </div>
                </Space>
              </Card>
            </Col>
          )}
        </Row>

        <Modal
          title={selectedIssue?.title}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedIssue && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary">State</Typography.Text>
                <div>
                  <Tag color={selectedIssue.state.color}>
                    {selectedIssue.state.name}
                  </Tag>
                </div>
              </div>

              {selectedIssue.projectMilestone && (
                <div>
                  <Typography.Text type="secondary">Milestone</Typography.Text>
                  <div>
                    <Tag>
                      {selectedIssue.projectMilestone.name}
                      {selectedIssue.projectMilestone.targetDate && (
                        <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                          {new Date(selectedIssue.projectMilestone.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </Tag>
                    {selectedIssue.projectMilestone.description && (
                      <div style={{ marginTop: 4, fontSize: '14px', color: '#666' }}>
                        {selectedIssue.projectMilestone.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Typography.Text type="secondary">Priority</Typography.Text>
                <div>
                  <Tag color={
                    selectedIssue.priority === 0 ? 'gray' :
                    selectedIssue.priority === 1 ? 'blue' :
                    selectedIssue.priority === 2 ? 'orange' : 'red'
                  }>
                    P{selectedIssue.priority}
                  </Tag>
                </div>
              </div>

              <div>
                <Typography.Text type="secondary">Labels</Typography.Text>
                <div>
                  <Space>
                    {selectedIssue.labels.nodes.map((label: Label) => (
                      <Tag key={label.id} color={label.color}>
                        {label.name}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>

              {selectedIssue.description && (
                <div>
                  <Typography.Text type="secondary">Description</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <MarkdownContent content={selectedIssue.description} />
                  </div>
                </div>
              )}
            </Space>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default ProjectIssues;
