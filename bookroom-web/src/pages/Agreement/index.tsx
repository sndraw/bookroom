import { useEffect, useState } from 'react';
import styles from './index.less';

const AgreementPage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState('');
  useEffect(() => {
    fetch('./agreement-fragment.txt')
      .then((response) => response.text())
      .then((data) => {
        setHtmlContent(data);
      });
  }, []);
  return (
    <div
      className={styles.container}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    ></div>
  );
};

export default AgreementPage;
