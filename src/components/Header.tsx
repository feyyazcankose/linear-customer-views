import React, { useEffect, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { LogoutOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { getOrganization } from '../services/linearClient';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';

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
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>{organization?.name ? `${organization.name} - Linear View` : 'Linear View'}</title>
        {organization?.logoUrl && (
          <link rel="icon" type="image/png" href={organization.logoUrl} />
        )}
      </Helmet>

      <div style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        top: 0,
        backgroundColor: isDarkMode ? '#141414' : 'white',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NavLink to="/projects" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} >
            {organization?.logoUrl && (
              <img 
                src={organization.logoUrl} 
                alt={organization.name}
                style={{ height: '24px', width: 'auto' }}
              />
            )}
            <Text strong style={{ fontSize: '16px', color: isDarkMode ? '#fff' : undefined }}>
              {organization?.name}
            </Text>
          </NavLink>
        </div>

        <Space>
          <Button
            type="text"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          />
          <Button 
            type="text" 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </div>
    </>
  );
};

export default Header;
