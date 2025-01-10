import { Typography } from 'antd';
import { useTheme } from '../context/ThemeContext';

const { Text } = Typography;

export default function Footer() {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      padding: '16px',
      textAlign: 'center',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDarkMode ? '#141414' : '#fff',
    }}>
      <Text style={{ 
        fontSize: '14px',
        color: isDarkMode ? '#999' : '#666'
      }}>
        Powered by{' '}
        <a 
          href="https://github.com/feyyazcankose" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: isDarkMode ? '#1890ff' : '#1677ff',
            textDecoration: 'none'
          }}
        >
          feyyazcankose
        </a>
      </Text>
    </div>
  );
}
