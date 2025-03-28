import { AI_GRAPH_MODE_ENUM } from '@/common/ai';
import ChatPanel from '@/components/ChatPanel';
import Page404 from '@/pages/404';
import { graphChat } from '@/services/common/ai/graph';
import { useModel, useParams, useRequest } from '@umijs/max';
import { Divider, Flex, Radio, Slider, Space, Switch, Tag } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import { queryAIChatList, saveAIChat } from '@/services/common/ai/chat';
import GraphChatParameters, { defaultParameters, ParametersType } from '@/components/Graph/GraphChatParameters';

const AIGraphChatPage: React.FC = () => {
  const { graph, workspace } = useParams();
  const [parameters, setParameters] = useState<ParametersType>(defaultParameters);
  const { getGraphName } = useModel('graphList');

  // 对话列表-请求
  const { data: chatList, loading: chatListLoading, run: chatListRun } = useRequest(
    () =>
      queryAIChatList({
        query_mode: 'search',
        platform: graph || '',
        model: workspace || '',
        type: 1,
      }),
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (graph) {
      chatListRun();
    }
  }, [graph]);

  useEffect(() => {
    if (chatList?.record) {
      setParameters({
        ...parameters,
        ...(chatList?.record?.parameters || {}),
      });
    }
  }, [chatList?.record]);

  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    const newMessages = [
      ...(messages || []),
    ];
    return await graphChat(
      {
        graph: graph || '',
        workspace: workspace,
        is_stream: parameters?.isStream,
      },
      {
        format: '',
        mode: parameters?.mode,
        top_k: parameters?.topK,
        query: newMessages[newMessages?.length - 1]?.content,
        only_need_context: parameters?.onlyNeedContext,
        only_need_prompt: parameters?.onlyNeedPrompt,
      },
      {
        ...(options || {}),
      },
    );
  };
  if (!graph || !workspace) {
    return <Page404 title={'非法访问'} />;
  }

  const isLoading = chatListLoading;

  return (
    <ChatPanel
      className={styles?.pageContainer}
      customRequest={sendMsgRequest}
      defaultMessageList={chatList?.record?.messages}
      disabled={isLoading}
      onSend={(messageList) => {
        saveAIChat(
          {
            platform: graph,
            model: workspace,
            type: 1,
            parameters,
            messages: messageList
          })
      }}
      onStop={() => { }}
      onClear={() => {
        saveAIChat(
          {
            platform: graph,
            model: workspace,
            name: "",
            type: 1,
            parameters,
            messages: []
          })
      }}
    >
      <div>
        <Space size={0} wrap className={styles.chatTags}>
          <span>{getGraphName(graph)}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.chatTitle}>
          <span>{workspace}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.chatTags}>
          <Tag color="default">无记忆模式</Tag>
          <GraphChatParameters
            platform={graph}
            parameters={parameters}
            changeParameters={(newParameters) => {
              // 如果未改变，则不更新参数 */
              if (JSON.stringify(parameters) === JSON.stringify(newParameters)) {
                return;
              }
              setParameters(newParameters);
              saveAIChat({
                platform: graph,
                model: workspace,
                parameters: newParameters,
              });
            }}
          />
        </Space>
      </div>
    </ChatPanel>
  );
};

export default AIGraphChatPage;
