import { MODE_ENUM } from '@/constants/DataMap';
import { useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect, useState } from 'react';
import Page404 from '@/pages/404';
import AgentPanel from '@/components/Agent/AgentPanel';
import styles from './index.less';
import { getAgentInfo } from '@/services/common/agent';
import { Alert, Divider, Empty, Space, Spin } from 'antd';
import ChatPanel from '@/components/ChatPanel';
import { RobotOutlined } from '@ant-design/icons';
import AgentParamters, { defaultParamters, ParamtersType } from '@/components/Agent/AgentParamters';

const AgentTaskPage: React.FC = () => {

    const { agent } = useParams<{ agent: string }>();
    const [paramters, setParamters] = useState<ParamtersType>(defaultParamters);

    // 模型信息-请求
    const { data, loading, error, run } = useRequest(
        () =>
            getAgentInfo({
                agent: agent || '',
            }),
        {
            manual: true,
        },
    );

    const sendMsgRequest = async (data: any, options: any) => {
        console.log(data, options);
        // 发送消息的逻辑
    };


    useEffect(() => {
        if (agent) {
            run();
        }
    }, [agent]);

    useEffect(() => {
        // 如果paramters有变化，保存数据到后端
        
    }, [paramters]);


    if (!agent) {
        return <Page404 title={'非法访问'} />;
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Alert message={error?.message} type="error" />
            </div>
        );
    }

    if (!data) {
        return <Empty description="暂无数据" />;
    }

    return (
        // <AgentPanel
        //     className={styles.pageContainer}
        //     agentInfo={data}
        //     disabled={loading}
        // />
        <ChatPanel
            className={styles?.pageContainer}
            sendOptions={
                {
                    placeholder: '请输入任务提示以启动新任务',
                }
            }
            customRequest={sendMsgRequest}
            onSend={() => { }}
            onStop={() => { }}
        >
            <div>
                <Space size={0} wrap className={styles.chatTitle}>
                    <RobotOutlined color='primary' />
                </Space>
                <Divider type="vertical" />
                <Space size={0} wrap className={styles.chatTags}>
                    <span>{agent}</span>
                </Space>
                <Divider type="vertical" />
                <Space size={0} wrap className={styles.chatTags}>
                    <AgentParamters
                        data={data}
                        paramters={paramters}
                        setParamters={setParamters}
                    />
                </Space>
            </div>
        </ChatPanel>
    );
};

export default AgentTaskPage;
