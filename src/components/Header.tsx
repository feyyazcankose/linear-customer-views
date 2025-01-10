import React from 'react';
import { Button, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('projectAccess');
    navigate('/login');
  };

  return (
    <div style={{
      padding: '10px',
      display:"flex",
      justifyContent:"flex-end",
    }}>
        <Button 
          type="text" 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
    </div>
  );
};

export default Header;
