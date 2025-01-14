import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Spin,
  Space,
  Tag,
  Modal,
  Layout,
  Row,
  Col,
  Card,
  Timeline,
  Input,
  Select,
  message,
  Button,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { getProjectIssues } from "../services/linearClient";
import { useTheme } from "../context/ThemeContext";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import useDebounce from "../hooks/useDebounce";
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all");
  const { projectId } = useParams<{ projectId: string }>();
  const { isDarkMode } = useTheme();
  const isMobile = window.innerWidth < 768;

  const debouncedSearchText = useDebounce(searchText, 300);
  const debouncedLabels = useDebounce(selectedLabels, 300);
  const debouncedStates = useDebounce(selectedStates, 300);

  useEffect(() => {
    fetchProjectIssues();
  }, [projectId]);

  const fetchProjectIssues = async () => {
    if (!projectId) {
      message.error("Project ID is missing");
      return;
    }

    try {
      const data = await getProjectIssues(projectId);
      console.log("Fetched project data:", data);
      setProjectData(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
      message.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  const showIssueDetails = (record: Issue) => {
    setSelectedIssue(record);
    setIsModalVisible(true);
  };

  const priorityMap = {
    0: { text: t('project.priority_levels.no_priority'), color: "#6B7280" },
    1: { text: t('project.priority_levels.high'), color: "#EF4444" },
    2: { text: t('project.priority_levels.medium'), color: "#F59E0B" },
    3: { text: t('project.priority_levels.low'), color: "#10B981" },
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredIssues =
    projectData?.issues?.nodes.filter((issue) => {
      if (
        debouncedSearchText &&
        !issue.title.toLowerCase().includes(debouncedSearchText.toLowerCase())
      ) {
        return false;
      }

      if (
        debouncedLabels.length > 0 &&
        !issue.labels?.nodes.some((label) =>
          debouncedLabels.includes(label.name)
        )
      ) {
        return false;
      }

      if (
        debouncedStates.length > 0 &&
        !debouncedStates.includes(issue.state.name)
      ) {
        return false;
      }

      if (
        selectedMilestone !== "all" &&
        (!issue.projectMilestone ||
          issue.projectMilestone.id !== selectedMilestone)
      ) {
        return false;
      }

      return true;
    }) || [];

  const columns: ColumnsType<Issue> = [
    {
      title: t('project.title'),
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Issue) => (
        <a onClick={() => showIssueDetails(record)}>{text}</a>
      ),
    },
    {
      title: t('project.status'),
      dataIndex: ["state", "name"],
      key: "state",
      render: (text: string, record: Issue) => (
        <Tag color={record.state.color}>{text}</Tag>
      ),
    },
    {
      title: t('project.priority'),
      dataIndex: "priority",
      key: "priority",
      render: (priority: number) => (
        <Tag color={priorityMap[priority as keyof typeof priorityMap].color}>
          {priorityMap[priority as keyof typeof priorityMap].text}
        </Tag>
      ),
    },
    {
      title: t('project.labels'),
      dataIndex: "labels",
      key: "labels",
      render: (labels: { nodes: Array<{ name: string; color: string }> }) => (
        <Space size={[0, 8]} wrap>
          {labels?.nodes.map((label) => (
            <Tag key={label.name} color={label.color}>
              {label.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('project.milestone'),
      dataIndex: ["projectMilestone", "name"],
      key: "milestone",
      render: (text: string, record: Issue) => (
        <Space>
          {record.projectMilestone && (
            <>
              <CalendarOutlined />
              <span>{text}</span>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getAllLabels = () => {
    const labels = projectData?.issues?.nodes.flatMap(
      (issue) => issue.labels?.nodes.map((label) => label.name) || []
    );
    return Array.from(new Set(labels)).map((label) => ({
      label,
      value: label,
    }));
  };

  const getAllStates = () => {
    const states = projectData?.issues?.nodes.map((issue) => issue.state.name);
    return Array.from(new Set(states)).map((state) => ({
      label: state,
      value: state,
    }));
  };

  return (
    <>
      <Helmet>
        <title>{projectData ? `${projectData.name} - ${t('project.title')}` : t('common.loading')}</title>
      </Helmet>

      <Layout style={{ padding: isMobile ? "12px" : "24px", background: isDarkMode ? "#141414" : "#fff" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
            {/* Sol Taraf - Görevler Tablosu */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Input
                      placeholder={t('project.filters.search_placeholder')}
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Space wrap>
                      <Select
                        mode="multiple"
                        style={{ minWidth: isMobile ? "100%" : 200 }}
                        placeholder={t('project.filters.select_labels')}
                        value={selectedLabels}
                        onChange={setSelectedLabels}
                        options={getAllLabels()}
                      />
                      <Select
                        mode="multiple"
                        style={{ minWidth: isMobile ? "100%" : 200 }}
                        placeholder={t('project.filters.select_states')}
                        value={selectedStates}
                        onChange={setSelectedStates}
                        options={getAllStates()}
                      />
                    </Space>
                  </Space>
                </Card>

                <Table
                  columns={columns.map(column => ({
                    ...column,
                    ellipsis: isMobile,
                  }))}
                  dataSource={filteredIssues}
                  rowKey="id"
                  style={{ 
                    background: isDarkMode ? "#1f1f1f" : "#fff",
                    borderRadius: "8px"
                  }}
                  scroll={{ x: isMobile ? 800 : undefined }}
                />
              </Space>
            </Col>

            {/* Sağ Taraf - Proje Bilgileri ve Kilometre Taşları */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>{t('project.timeline')}</span>
                  </Space>
                }
                style={{
                  background: isDarkMode ? "#1f1f1f" : "#fff",
                  position: isMobile ? "relative" : "sticky",
                  top: 24,
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">{t('project.duration')}</Text>
                    <div style={{ marginTop: 8 }}>
                      {projectData?.startDate && (
                        <Tag color="blue">
                          {t('project.start')}: {formatDate(projectData.startDate)}
                        </Tag>
                      )}
                      {projectData?.targetDate && (
                        <Tag color="orange">
                          {t('project.target')}: {formatDate(projectData.targetDate)}
                        </Tag>
                      )}
                    </div>
                  </div>

                  {projectData?.description && (
                    <div>
                      <Text type="secondary">{t('project.description')}</Text>
                      <div style={{ marginTop: 8 }}>
                        <ReactMarkdown>{projectData.description}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div>
                    <Text strong>{t('project.milestones')}</Text>
                    <Timeline style={{ marginTop: 8 }}>
                      <Timeline.Item>
                        <div
                          onClick={() => setSelectedMilestone("all")}
                          style={{
                            cursor: "pointer",
                            padding: "8px",
                            background:
                              selectedMilestone === "all"
                                ? isDarkMode
                                  ? "#2a2a2a"
                                  : "#f0f0f0"
                                : "transparent",
                            borderRadius: "4px",
                            marginBottom: "4px",
                          }}
                        >
                          <Text strong>{t('project.all_issues')}</Text>
                        </div>
                      </Timeline.Item>
                      {[...(projectData?.projectMilestones?.nodes || [])]
                        .sort((a, b) => {
                          if (!a.targetDate) return 1;
                          if (!b.targetDate) return -1;
                          return (
                            new Date(a.targetDate).getTime() -
                            new Date(b.targetDate).getTime()
                          );
                        })
                        .map((milestone) => (
                          <Timeline.Item key={milestone.id}>
                            <div
                              onClick={() => setSelectedMilestone(milestone.id)}
                              style={{
                                cursor: "pointer",
                                padding: "8px",
                                background:
                                  selectedMilestone === milestone.id
                                    ? isDarkMode
                                      ? "#2a2a2a"
                                      : "#f0f0f0"
                                    : "transparent",
                                borderRadius: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              <Text strong>{milestone.name}</Text>
                              {milestone.targetDate && (
                                <div style={{ fontSize: "12px", color: "#888", marginTop: 4 }}>
                                  {t('project.target')}: {formatDate(milestone.targetDate)}
                                </div>
                              )}
                              {milestone.description && (
                                <div style={{ marginTop: 4, fontSize: "14px" }}>
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
        )}

        <Modal
          title={t('project.details')}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              {t('actions.close')}
            </Button>,
          ]}
          width={isMobile ? "100%" : 800}
          style={{ top: isMobile ? 0 : 100 }}
        >
          {selectedIssue && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4} style={{ fontSize: isMobile ? "18px" : "24px" }}>{selectedIssue.title}</Title>
              <Space wrap>
                <Tag color={selectedIssue.state.color}>
                  {selectedIssue.state.name}
                </Tag>
                <Tag
                  color={
                    priorityMap[
                      selectedIssue.priority as keyof typeof priorityMap
                    ].color
                  }
                >
                  {
                    priorityMap[
                      selectedIssue.priority as keyof typeof priorityMap
                    ].text
                  }
                </Tag>
                {selectedIssue.labels?.nodes.map((label) => (
                  <Tag key={label.name} color={label.color}>
                    {label.name}
                  </Tag>
                ))}
              </Space>
              <div>
                <Text type="secondary">
                  {t('project.created_at')}: {formatDateTime(selectedIssue.createdAt)}
                </Text>
                <br />
                <Text type="secondary">
                  {t('project.updated_at')}: {formatDateTime(selectedIssue.updatedAt)}
                </Text>
              </div>
              {selectedIssue.projectMilestone && (
                <div>
                  <Text strong>{t('project.milestone')}:</Text>{" "}
                  {selectedIssue.projectMilestone.name}
                  {selectedIssue.projectMilestone.targetDate && (
                    <Text type="secondary">
                      {" "}
                      ({formatDate(selectedIssue.projectMilestone.targetDate)})
                    </Text>
                  )}
                </div>
              )}
              <div>
                <Text strong>{t('project.description')}:</Text>
                <div style={{ marginTop: "8px" }}>
                  {selectedIssue.description ? (
                    <ReactMarkdown>{selectedIssue.description}</ReactMarkdown>
                  ) : (
                    <Text type="secondary">{t('project.no_description')}</Text>
                  )}
                </div>
              </div>
            </Space>
          )}
        </Modal>
      </Layout>
    </>
  );
};

export default ProjectIssues;
