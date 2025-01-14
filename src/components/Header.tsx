import React, { useEffect, useState } from 'react';
import { Button, Space, Typography, Drawer, Menu } from 'antd';
import { LogoutOutlined, MoonOutlined, SunOutlined, MenuOutlined, HomeOutlined, ProjectOutlined, GlobalOutlined } from '@ant-design/icons';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getOrganization } from '../services/linearClient';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const { Title, Text } = Typography;

interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        background: isDarkMode ? '#1f1f1f' : '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        <Space>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: "5px" }}>
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
              title={
                <Space style={{ width: '100%' }}>
                  {organization?.logoUrl && (
                    <img
                      src={organization.logoUrl}
                      alt={organization.name}
                      style={{ height: '24px' }}
                    />
                  )}
                  <Text strong>{organization?.name}</Text>
                </Space>
              }
              placement="right"
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              bodyStyle={{
                padding: 0,
                background: isDarkMode ? '#141414' : '#fff'
              }}
              headerStyle={{
                background: isDarkMode ? '#1f1f1f' : '#fff',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
              }}
              style={{
                background: isDarkMode ? '#141414' : '#fff'
              }}
            >
              <Menu
                mode="vertical"
                style={{
                  border: 'none',
                  background: isDarkMode ? '#141414' : '#fff'
                }}
                selectedKeys={[location.pathname]}
              >
                <Menu.Item
                  key="/projects"
                  icon={<ProjectOutlined />}
                  style={{
                    margin: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  <NavLink to="/projects" onClick={() => setDrawerVisible(false)}>
                    {t('common.projects')}
                  </NavLink>
                </Menu.Item>
                <Menu.Divider style={{
                  background: isDarkMode ? '#303030' : '#f0f0f0',
                  margin: '8px 0'
                }} />
                <Menu.Item
                  key="language"
                  icon={<GlobalOutlined />}
                  style={{
                    margin: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  <LanguageSwitcher />
                </Menu.Item>
                <Menu.Item
                  key="theme"
                  icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                  onClick={toggleTheme}
                  style={{
                    margin: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {isDarkMode ? t('common.light_mode') : t('common.dark_mode')}
                </Menu.Item>
                <Menu.Divider style={{
                  background: isDarkMode ? '#303030' : '#f0f0f0',
                  margin: '8px 0'
                }} />
                <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  danger
                  style={{
                    margin: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {t('actions.logout')}
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
