import React from 'react';
import { Spin } from 'antd';
import { useTheme } from '../context/ThemeContext';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = true }) => {
  const { isDarkMode } = useTheme();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDarkMode ? '#141414' : '#fff',
    ...(fullScreen ? {
      minHeight: '100vh',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    } : {
      padding: '2rem'
    })
  };

  return (
    <div style={containerStyle}>
      <Spin size="large" style={{ 
        color: isDarkMode ? '#fff' : undefined 
      }} />
    </div>
  );
};

export default Loader;
