import { useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect, useState } from 'react';
import Page404 from '@/pages/404';
import AgentPanel from '@/components/Agent/AgentPanel';
import styles from './index.less';
import { getAgentInfo, updateAgent } from '@/services/common/agent';
import { Alert, Divider, Empty, Space, Spin } from 'antd';
import ChatPanel from '@/components/ChatPanel';
import { RobotOutlined } from '@ant-design/icons';
import AgentParamters, { defaultParamters, ParamtersType } from '@/components/Agent/AgentParamters';

const AgentTaskPage: React.FC = () => {

    const { agent, platform } = useParams();
    const [paramters, setParamters] = useState<ParamtersType>(defaultParamters);
    const [init, setInit] = useState(false);
    // 模型信息-请求
    const { data, loading, error, run } = useRequest(
        () =>
            getAgentInfo({
                platform: platform || '',
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
            run().then((resData) => {
                if (resData && resData.paramters) {
                    setParamters({
                        ...paramters,
                        ...resData.paramters
                    });
                }
                setTimeout(() => {
                    setInit(true);
                }, 500);
            })
        }
    }, [agent]);

    useEffect(() => {
        if (platform && data && init) {
            // 如果paramters有变化，保存数据到后端
            updateAgent({
                platform,
                agent: data?.id
            }, {
                ...data,
                paramters
            })
        }
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
                    <span>{data?.name}</span>
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
