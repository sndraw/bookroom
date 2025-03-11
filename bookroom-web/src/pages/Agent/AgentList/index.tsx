import { MODE_ENUM } from '@/constants/DataMap';
import { queryAgentList } from '@/services/common/agent';
import { useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect } from 'react';
import AgentList from '@/components/Agent/AgentList';
import styles from './index.less';

const AgentListPage: React.FC = () => {

    // Agent列表-请求
    const { data, loading, run } = useRequest(
        () => {
            return queryAgentList();
        },
        {
            manual: true,
        },
    );
    useEffect(() => {
        run();
    }, []);


    return (
        <AgentList
            mode={MODE_ENUM.EDIT}
            className={styles.pageContainer}
            dataList={data}
            loading={loading}
            refresh={run}
        />
    );
};

export default AgentListPage;
