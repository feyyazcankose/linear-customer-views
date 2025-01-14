import React, { useEffect, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { LogoutOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { getOrganization } from '../services/linearClient';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const { Text } = Typography;

interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const orgData = await getOrganization();
        setOrganization(orgData);
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };
    fetchOrganization();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('projectAccess');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>{organization?.name || t('common.loading')} - Linear View</title>
      </Helmet>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <Space>
          {organization?.logoUrl && (
            <img src={organization.logoUrl} alt={organization.name} style={{ height: '30px' }} />
          )}
          <Text strong>{organization?.name}</Text>
        </Space>

        <Space style={{ marginLeft: 'auto' }}>
          <NavLink to="/projects" style={{ color: 'inherit', textDecoration: 'none' }}>
            {t('common.projects')}
          </NavLink>
          <LanguageSwitcher />
          <Button
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            type="text"
          />
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            type="text"
            danger
          >
            {t('actions.logout')}
          </Button>
        </Space>
      </div>
    </>
  );
};

export default Header;
