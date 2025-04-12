import ChatPanel from '@/components/Chat/ChatPanel';
import Page404 from '@/pages/404';
import { AILmEmbed, getAILmInfo } from '@/services/common/ai/lm';
import { Access, useAccess, useModel, useParams, useRequest } from '@umijs/max';
import { Divider, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import EmbedParameters, { defaultParameters, ParametersType } from '@/components/Chat/ChatPanel/EmbedParameters';
import { queryAIChatList, saveAIChat } from '@/services/common/ai/chat';
import { CHAT_TYPE } from '@/common/chat';

const chatType = CHAT_TYPE.EMBED;

const AILmEmbedPage: React.FC = () => {
  const access = useAccess();
  const { platform, model } = useParams();
  const [parameters, setParameters] = useState<ParametersType>(defaultParameters);

  const { getPlatformName } = useModel('lmplatformList');

  // 模型信息-请求
  const { data, loading, run } = useRequest(
    () =>
      getAILmInfo({
        platform: platform || '',
        model: model ? encodeURIComponent(model.trim()) : '',
      }),
    {
      manual: true,
    },
  );
  // 对话列表-请求
  const { data: chatList, loading: chatListLoading, run: chatListRun } = useRequest(
    () =>
      queryAIChatList({
        query_mode: 'search',
        platform: platform || '',
        model: model || '',
        type: chatType,
      }),
    {
      manual: true,
    },
  );
  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    const input = messages[messages.length - 1]?.content || '';

    return await AILmEmbed(
      {
        platform: platform || '',
        model: encodeURIComponent(model || ''),
        is_stream: false,
      },
      {
        model: model || '',
        input: [input]
      },
      {
        ...(options || {}),
      },
    );
  };

  useEffect(() => {
    if (model) {
      run();
      chatListRun();
    }
  }, [model]);

  useEffect(() => {
    if (chatList?.record?.parameters instanceof Object) {
      setParameters({
        ...parameters,
        ...(chatList?.record?.parameters || {}),
      });
    }
  }, [chatList?.record]);

  // 检查参数是否有效
  if (!platform || !model) {
    return <Page404 title={'非法访问'} />;
  }
  const isLoading = loading || chatListLoading;

  return (
    <ChatPanel
      className={styles?.chatContainer}
      disabled={isLoading}
      defaultMessageList={chatList?.record?.messages}
      customRequest={sendMsgRequest}
      isFiles={true}
      isVoice={true}
      saveAIChat={(messageList: any) => {
        saveAIChat(
          {
            platform,
            model,
            type: chatType,
            parameters,
            messages: messageList
          })
      }}
    >
      <div>
        <Space size={0} wrap className={styles.chatTags}>
          <span>{getPlatformName(platform)}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.chatTitle}>
          <span>{data?.name}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.chatTags}>
          <Access accessible={access.canSeeAdmin}>
            <Tag color="default">接口类型：{data?.platformCode}</Tag>
            {data?.platformHost && (
              <Tag color="default">API：{data?.platformHost}/api/chat</Tag>
            )}
          </Access>
          <EmbedParameters
            platform={platform}
            data={data}
            parameters={parameters}
            changeParameters={(newParameters) => {
              // 如果未改变，则不更新参数 */
              if (JSON.stringify(parameters) === JSON.stringify(newParameters)) {
                return;
              }
              setParameters(newParameters);
              saveAIChat({
                platform,
                model,
                parameters: newParameters,
                type: chatType,
              });
            }}
          />
        </Space>
      </div>
    </ChatPanel>
  );
};

export default AILmEmbedPage;
