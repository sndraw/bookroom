import { MODE_ENUM } from '@/constants/DataMap';
import { queryAgentList } from '@/services/common/agent';
import { generatePath, useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect } from 'react';
import Page404 from '@/pages/404';
import AgentList from '@/components/Agent/AgentList';
import styles from './index.less';
import ROUTE_MAP from '@/routers/routeMap';

const AgentListPage: React.FC = () => {
    const { platform } = useParams();
    const navigate = useNavigate();

    // Agent列表-请求
    const { data, loading, run } = useRequest(
        () => {
            return queryAgentList({
                platform: platform || "",
            });
        },
        {
            manual: true,
        },
    );
    useEffect(() => {
        if (!platform) {
            return;
        }
        run();
    }, [platform]);

    if (!platform) {
        return <Page404 />;
    }

    return (
        <AgentList
            mode={MODE_ENUM.EDIT}
            className={styles.pageContainer}
            platform={platform}
            changePlatform={(newPlatform) => {
                navigate(generatePath(ROUTE_MAP.AGENT_LIST, { platform: newPlatform }));
            }}
            dataList={data?.list}
            loading={loading}
            refresh={run}
        />
    );
};

export default AgentListPage;
