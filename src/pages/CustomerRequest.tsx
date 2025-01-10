import { useState } from 'react';
import { Form, Input, Button, Select, Typography, Card, message } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { useParams } from 'react-router-dom';
import { createIssue } from '../services/linearClient';
import { Helmet } from 'react-helmet-async';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CustomerRequestForm {
  title: string;
  description: string;
  customerName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_PRIORITY';
}

const priorityOptions = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
  { label: 'No Priority', value: 'NO_PRIORITY' },
];

export default function CustomerRequest() {
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const { projectId } = useParams<{ projectId: string }>();
  const [form] = Form.useForm();

  const onFinish = async (values: CustomerRequestForm) => {
    if (!projectId) {
      message.error('Project ID not found');
      return;
    }

    setLoading(true);
    try {
      const title = `[CS] ${values.title}`;
      const description = `**Customer Name:** ${values.customerName}\n\n${values.description}`;

      console.log('Creating issue with:', {
        projectId,
        title,
        description,
        priority: values.priority
      });

      const result = await createIssue({
        projectId,
        title,
        description,
        priority: values.priority,
      });

      console.log('Issue creation result:', result);

      message.success('Request created successfully');
      form.resetFields();
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        message.error(`Error: ${error.message}`);
      } else {
        message.error('Failed to create request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Customer Request - Linear View</title>
      </Helmet>

      <div style={{ 
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Title level={2} style={{ 
          marginBottom: '24px',
          color: isDarkMode ? '#fff' : undefined 
        }}>
          Create Customer Request
        </Title>

        <Card
          style={{ 
            background: isDarkMode ? '#1f1f1f' : '#fff',
            borderColor: isDarkMode ? '#303030' : undefined
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ priority: 'MEDIUM' }}
          >
            <Form.Item
              name="title"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Title</Text>}
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input 
                placeholder="Request title"
                style={{ 
                  background: isDarkMode ? '#141414' : '#fff',
                  borderColor: isDarkMode ? '#303030' : undefined,
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Description</Text>}
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <TextArea 
                rows={4}
                placeholder="Request details"
                style={{ 
                  background: isDarkMode ? '#141414' : '#fff',
                  borderColor: isDarkMode ? '#303030' : undefined,
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <Form.Item
              name="customerName"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Customer Name</Text>}
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input 
                placeholder="Customer name"
                style={{ 
                  background: isDarkMode ? '#141414' : '#fff',
                  borderColor: isDarkMode ? '#303030' : undefined,
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Priority</Text>}
              rules={[{ required: true, message: 'Please select a priority level' }]}
            >
              <Select
                options={priorityOptions}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                block
              >
                Submit Request
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}
