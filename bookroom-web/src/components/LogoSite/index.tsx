// import { useModel } from '@umijs/max';
import classNames from 'classnames';
import styles from './index.less';

type LogoSiteProps = {
  className?: string;
};

const LogoSite: React.FC<LogoSiteProps> = ({ className }) => {
  // 主题样式
  // const { initialState } = useModel('@@initialState');
  // const { siteInfo } = initialState || {};
  return (
    <img
      src={process.env?.UMI_APP_LOGO_URL || '/favicon.png'}
      className={classNames(styles.logo, className)}
      alt="logo"
      data-id="logo"
    />
  );
};
export default LogoSite;
