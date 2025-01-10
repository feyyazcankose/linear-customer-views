import React, { useState } from 'react';
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
  { label: 'Yüksek', value: 'HIGH' },
  { label: 'Orta', value: 'MEDIUM' },
  { label: 'Düşük', value: 'LOW' },
  { label: 'Önceliksiz', value: 'NO_PRIORITY' },
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
      const description = `**Müşteri Adı:** ${values.customerName}\n\n${values.description}`;

      await createIssue({
        projectId,
        title,
        description,
        priority: values.priority,
      });

      message.success('İstek başarıyla gönderildi');
      form.resetFields();
    } catch (error) {
      console.error('Error creating issue:', error);
      message.error('İstek gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Müşteri İsteği - Linear View</title>
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
          Müşteri İsteği Oluştur
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
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Başlık</Text>}
              rules={[{ required: true, message: 'Lütfen bir başlık girin' }]}
            >
              <Input 
                placeholder="İstek başlığı"
                style={{ 
                  background: isDarkMode ? '#141414' : '#fff',
                  borderColor: isDarkMode ? '#303030' : undefined,
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Açıklama</Text>}
              rules={[{ required: true, message: 'Lütfen bir açıklama girin' }]}
            >
              <TextArea 
                rows={4}
                placeholder="İstek detayları"
                style={{ 
                  background: isDarkMode ? '#141414' : '#fff',
                  borderColor: isDarkMode ? '#303030' : undefined,
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <Form.Item
              name="customerName"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Müşteri Adı</Text>}
              rules={[{ required: true, message: 'Lütfen müşteri adını girin' }]}
            >
              <Input 
                placeholder="Müşteri adı"
                style={{ 
                  background: isDarkMode ? '#141414' : '#fff',
                  borderColor: isDarkMode ? '#303030' : undefined,
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label={<Text style={{ color: isDarkMode ? '#fff' : undefined }}>Öncelik</Text>}
              rules={[{ required: true, message: 'Lütfen bir öncelik seviyesi seçin' }]}
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
                İsteği Gönder
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}
