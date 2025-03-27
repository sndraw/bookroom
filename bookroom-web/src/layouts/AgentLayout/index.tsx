import {
  Outlet,
} from '@umijs/max';
import DefaultLayout from '../DefaultLayout';

export type PropsType = {
  children: JSX.Element;
  title: string;
};

const AgentLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title } = props;

  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
};
export default AgentLayout;
