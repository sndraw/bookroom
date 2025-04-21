// import { useModel } from '@umijs/max';
import classNames from 'classnames';
import Icon from '@ant-design/icons';
import styles from './index.less';

type LogoSiteProps = {
  className?: string;
};

const LogoSite: React.FC<LogoSiteProps> = ({ className }) => {
  const logoUrl = process.env?.UMI_APP_LOGO_URL || './logo.png';

  return (
    <img
      src={logoUrl || ""}
      className={classNames(styles.logo, className)}
      alt="logo"
      data-id="logo"
    />
  );
};
export default LogoSite;
