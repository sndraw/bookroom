import { useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect, useState } from 'react';
import Page404 from '@/pages/404';
import AgentPanel from '@/components/Agent/AgentPanel';
import styles from './index.less';
import { agentChat, getAgentInfo, updateAgent } from '@/services/common/agent';
import { Alert, Divider, Empty, Space, Spin, Tag } from 'antd';
import ChatPanel from '@/components/Chat/ChatPanel';
import { RobotOutlined } from '@ant-design/icons';
import AgentParameters, { defaultParameters, ParametersType } from '@/components/Agent/AgentParameters';

const AgentTaskPage: React.FC = () => {

    const { agent } = useParams();
    const [parameters, setParameters] = useState<ParametersType>(defaultParameters);
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
        const { messages } = data || {};
        return await agentChat(
            {
                agent: agent,
                is_stream: parameters?.isStream,
            },
            {
                query: messages[messages?.length - 1]
            },
            {
                ...(options || {}),
            },
        );
    };


    useEffect(() => {
        if (agent) {
            run()
        }
    }, [agent]);

    useEffect(() => {
        if (data?.parameters instanceof Object) {
            setParameters({
                ...parameters,
                ...(data?.parameters || {}),
            });
        }
    }, [data]);


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
                    placeholder: '请输入任务指令以启动新任务',
                }
            }
            defaultMessageList={data?.messages}
            isImages={true}
            isVoice={true}
            voiceParams={parameters?.voiceParams}
            customRequest={sendMsgRequest}
            saveAIChat={(messages) => {
                updateAgent({
                    agent: data?.id
                }, {
                    messages
                })
            }}
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
                    <Tag color="default">{parameters?.isMemory ? '记忆模式' : '无记忆模式'}</Tag>
                    <AgentParameters
                        data={data}
                        parameters={parameters}
                        changeParameters={(newParameters) => {
                            // 如果未改变，则不更新参数 */
                            if (JSON.stringify(parameters) === JSON.stringify(newParameters)) {
                                return;
                            }
                            setParameters(newParameters);
                            updateAgent({
                                agent: data?.id
                            }, {
                                parameters: newParameters,
                            })
                        }}
                    />
                </Space>
            </div>
        </ChatPanel>
    );
};

export default AgentTaskPage;
