import ChatPanel from '@/components/ChatPanel';
import Page404 from '@/pages/404';
import { AILmGenerate, getAILmInfo } from '@/services/common/ai/lm';
import { Access, useAccess, useModel, useParams, useRequest } from '@umijs/max';
import { Divider, Flex, Space, Switch, Tag } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import ChatParameters, { defaultParameters, ParametersType } from '@/components/ChatPanel/ChatParameters';
import { queryAIChatList, saveAIChat } from '@/services/common/ai/chat';

const chatType = 2;

const AILmGeneratePage: React.FC = () => {
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
    const prompt = messages[messages.length - 1]?.content || '';
    const images = messages[messages.length - 1]?.images || null;

    return await AILmGenerate(
      {
        platform: platform || '',
        model: encodeURIComponent(model || ''),
        is_stream: parameters?.isStream,
      },
      {
        model: model || '',
        prompt: prompt,
        format: '',
        images: images,
        top_p: parameters?.topP,
        top_k: parameters?.topK,
        temperature: parameters?.temperature, // 设置温度
        max_tokens: parameters?.maxTokens, // 设置最大token数
        repeat_penalty: parameters?.repeatPenalty, // 设置惩罚强度
        frequency_penalty: parameters?.frequencyPenalty, // 设置频率惩罚
        presence_penalty: parameters?.presencePenalty, // 设置存在惩罚
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
      isImages={parameters?.isImages}
      isVoice={true}
      voiceParams={parameters?.voiceParams}
      customRequest={sendMsgRequest}
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
          <ChatParameters
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

export default AILmGeneratePage;
