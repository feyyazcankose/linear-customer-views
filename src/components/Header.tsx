import React, { useEffect, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOrganization } from '../services/linearClient';

const { Text } = Typography;

interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      const orgData = await getOrganization();
      setOrganization(orgData);
    };
    fetchOrganization();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('projectAccess');
    navigate('/login');
  };

  return (
    <div style={{
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #f0f0f0'
    }}>
      

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {organization?.logoUrl && (
          <img 
            src={organization.logoUrl} 
            alt={organization.name}
            style={{ height: '24px', width: 'auto' }}
          />
        )}
        <Text strong style={{ fontSize: '16px' }}>
          {organization?.name}
        </Text>
      </div>

      <div>
        <Button 
          type="text" 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
