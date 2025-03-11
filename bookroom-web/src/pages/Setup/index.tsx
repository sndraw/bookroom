import RegisterLayout from '@/layouts/RegisterLayout';
import { setup } from '@/services/common/site';

const SetupPage: React.FC = () => {
  return (
    <RegisterLayout title="平台初始化" requestApi={setup} isSetup={true} />
  );
};

export default SetupPage;
