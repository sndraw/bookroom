import ChatPanel from '@/components/Chat/ChatPanel';
import Page404 from '@/pages/404';
import { AILmGenerate, getAILmInfo } from '@/services/common/ai/lm';
import { Access, useAccess, useModel, useParams, useRequest } from '@umijs/max';
import { Divider, Flex, Space, Switch, Tag } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import ChatParameters, { defaultParameters, ParametersType } from '@/components/Chat/ChatPanel/ChatParameters';
import { queryAIChatList, saveAIChat } from '@/services/common/ai/chat';
import { CHAT_TYPE } from '@/common/chat';

const chat_type = CHAT_TYPE.GENERATE;

const AILmGeneratePage: React.FC = () => {
  const access = useAccess();
  const { platform = "", model = "" } = useParams();
  const [parameters, setParameters] = useState<ParametersType>(defaultParameters);

  const { getPlatformName } = useModel('lmplatformList');

  // 模型信息-请求
  const { data, loading, run } = useRequest(
    () =>
      getAILmInfo({
        platform: platform,
        model: encodeURIComponent(model.trim()),
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
        platform: platform,
        model: model,
        chat_type: chat_type,
      }),
    {
      manual: true,
    },
  );
  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    let prompt = messages[messages.length - 1]?.content;
    if (Array.isArray(messages[messages.length - 1]?.content)) {
      prompt = messages[messages.length - 1]?.content?.[0]?.text
    }
    const images = messages[messages.length - 1]?.images || null;

    return await AILmGenerate(
      {
        platform: platform,
        model: encodeURIComponent(model),
        is_stream: parameters?.isStream,
      },
      {
        model: model,
        prompt: prompt,
        images: images
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
      sendOptions={
        {
          isFiles: false,
          filePrefix: `lm/${chat_type}/${platform}/${model}`,
        }
      }
      customRequest={sendMsgRequest}
      saveAIChat={(messageList: any) => {
        saveAIChat(
          {
            platform,
            model,
            chat_type: chat_type,
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
          <ChatParameters
            platform={platform}
            chat_type={chat_type}
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
                chat_type: chat_type,
              });
            }}
          />
        </Space>
      </div>
    </ChatPanel>
  );
};

export default AILmGeneratePage;
