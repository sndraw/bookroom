import ChatPanel from '@/components/ChatPanel';
import ChatParameters, {
  defaultParameters,
  ParametersType,
} from '@/components/ChatPanel/ChatParameters';
import PromptInput from '@/components/PromptInput';
import Page404 from '@/pages/404';
import { AILmChat, getAILmInfo } from '@/services/common/ai/lm';
import { Access, useAccess, useModel, useParams, useRequest } from '@umijs/max';
import { Divider, Space, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.less';
import { queryAIChatList, saveAIChat } from '@/services/common/ai/chat';

const AILmChatPage: React.FC = () => {
  const access = useAccess();
  const { platform, model } = useParams();
  const [parameters, setParameters] = useState<ParametersType>(defaultParameters);
  const [prompt, setPrompt] = useState<string>('');
  const [chatInfo, setChatInfo] = useState<API.AIChatInfo | null>(null);
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
      }),
    {
      manual: true,
    },
  );

  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    const newMessages = [
      ...(messages || []),
    ];
    return await AILmChat(
      {
        platform: platform || '',
        model: encodeURIComponent(model || ''),
        is_stream: parameters?.isStream,
      },
      {
        model: model || '',
        prompt: prompt, // 设置提示信息
        messages: [...newMessages],
        format: '',
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

  const isLoading = loading || chatListLoading;

  useEffect(() => {
    if (model) {
      run();
      chatListRun();
    }
  }, [model]);

  useEffect(() => {
    const chatInfo = chatList?.record;
    if (chatInfo) {
      setChatInfo(chatInfo);
    }
  }, [chatList]);

  useEffect(() => {
    if (chatInfo) {
      setParameters({
        ...parameters,
        ...(chatInfo?.parameters || {}),
      });
      setPrompt(chatInfo?.prompt || "");
    }
  }, [chatInfo]);

  // 检查参数是否有效
  if (!platform || !model) {
    return <Page404 title={'非法访问'} />;
  }

  return (
    <ChatPanel
      className={styles?.chatContainer}
      disabled={isLoading}
      defaultMessageList={chatInfo?.messages}
      supportImages={parameters?.supportImages}
      supportVoice={parameters?.supportVoice}
      customRequest={sendMsgRequest}
      onSend={(messageList) => {
        saveAIChat(
          {
            platform,
            model,
            type: 1,
            parameters,
            prompt,
            messages: messageList
          })
      }}
      onStop={() => { }}
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
            data={data}
            parameters={parameters}
            changeParameters={(newParameters)=>{
              setParameters(newParameters);
              saveAIChat({
                platform,
                model,
                parameters: newParameters,
              });
            }}
          />
        </Space>
        {/* 添加提示词输入框 */}
        <PromptInput
          title="提示词"
          prompt={prompt}
          onChange={(value: string) => {
            setPrompt(value);
          }}
        />
      </div>
    </ChatPanel>
  );
};

export default AILmChatPage;
