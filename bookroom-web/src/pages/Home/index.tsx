import Guide from '@/components/Guide';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import styles from './index.less';
const HomePage: React.FC = () => {

  const { name } = useModel('global');

  const [htmlContent, setHtmlContent] = useState('');
  useEffect(() => {
    fetch('./guide.md')
      .then((response) => response.text())
      .then((data) => {
        setHtmlContent(data);
      });
  }, []);
  return (
    <PageContainer ghost title={false}>
      <div className={styles.header}>
        <Guide name={name.trim()} />
      </div>
      <div className={styles.content}>
        <ReactMarkdown>{htmlContent}</ReactMarkdown>
      </div>
    </PageContainer>
  );
};

export default HomePage;
