import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      defaultValue={i18n.language}
      style={{ width: 120 }}
      onChange={handleLanguageChange}
      options={[
        { value: 'en', label: 'English' },
        { value: 'tr', label: 'Türkçe' },
      ]}
    />
  );
};

export default LanguageSwitcher;
