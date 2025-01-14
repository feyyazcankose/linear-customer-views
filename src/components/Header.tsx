import React, { useEffect, useState } from 'react';
import { Button, Space, Typography, Drawer, Menu } from 'antd';
import { LogoutOutlined, MoonOutlined, SunOutlined, MenuOutlined } from '@ant-design/icons';
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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setDrawerVisible(false);
  };

  const menuItems = (
    <>
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
    </>
  );

  return (
    <>
      <Helmet>
        <title>{organization?.name || t('common.loading')} - Linear View</title>
      </Helmet>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '10px 15px' : '10px 20px',
        // borderBottom: '1px solid #f0f0f0',
        background: isDarkMode ? '#1f1f1f' : '#fff',
      }}>
        <Space>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center',gap:"5px" }}>
          {organization?.logoUrl && (
            <img 
              src={organization.logoUrl} 
              alt={organization.name} 
              style={{ height: isMobile ? '24px' : '30px' }} 
            />
          )}
          <Text strong style={{ fontSize: isMobile ? '14px' : '16px' }}>
            {organization?.name}
          </Text>
          </NavLink>
        </Space>

        {isMobile ? (
          <>
            <Button
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              type="text"
              style={{ marginLeft: 'auto' }}
            />
            <Drawer
              title={organization?.name}
              placement="right"
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              bodyStyle={{ padding: 0 }}
            >
              <Menu mode="vertical" style={{ border: 'none' }}>
                <Menu.Item key="projects">
                  <NavLink to="/projects" onClick={() => setDrawerVisible(false)}>
                    {t('common.projects')}
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="language">
                  <LanguageSwitcher />
                </Menu.Item>
                <Menu.Item key="theme">
                  <Button
                    icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                    onClick={toggleTheme}
                    type="text"
                    block
                  />
                </Menu.Item>
                <Menu.Item key="logout">
                  <Button
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    type="text"
                    danger
                    block
                  >
                    {t('actions.logout')}
                  </Button>
                </Menu.Item>
              </Menu>
            </Drawer>
          </>
        ) : (
          <Space style={{ marginLeft: 'auto' }}>
            {menuItems}
          </Space>
        )}
      </div>
    </>
  );
};

export default Header;
