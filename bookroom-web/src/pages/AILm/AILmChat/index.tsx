import ChatPanel from '@/components/ChatPanel';
import ChatParamters, {
  defaultParamters,
  ParamtersType,
} from '@/components/ChatPanel/ChatParamters';
import PromptInput from '@/components/PromptInput';
import Page404 from '@/pages/404';
import { AILmChat, getAILmInfo } from '@/services/common/ai/lm';
import { Access, useAccess, useParams, useRequest } from '@umijs/max';
import { Divider, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const AILmChatPage: React.FC = () => {
  const access = useAccess();
  const { platform, model } = useParams();
  const [paramters, setParamters] = useState<ParamtersType>(defaultParamters);
  const [prompt, setPrompt] = useState<string>('');
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

  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    const newMessages = [
      // 添加到messages头部
      {
        role: 'system',
        content: prompt,
      },
      ...(messages || []),
    ];
    return await AILmChat(
      {
        platform: platform || '',
        model: encodeURIComponent(model || ''),
        is_stream: paramters?.isStream,
      },
      {
        model: model || '',
        messages: [...newMessages],
        format: '',
        top_p: paramters?.topP,
        top_k: paramters?.topK,
        temperature: paramters?.temperature, // 设置温度
        max_tokens: paramters?.maxTokens, // 设置最大token数
        repeat_penalty: paramters?.repeatPenalty, // 设置惩罚强度
        frequency_penalty: paramters?.frequencyPenalty, // 设置频率惩罚
        presence_penalty: paramters?.presencePenalty, // 设置存在惩罚
      },
      {
        ...(options || {}),
      },
    );
  };

  const isLoading = loading;
  useEffect(() => {
    if (model) {
      run();
    }
  }, [model]);
  // 检查参数是否有效
  if (!platform || !model) {
    return <Page404 title={'非法访问'} />;
  }

  return (
    <ChatPanel
      className={styles?.chatContainer}
      disabled={isLoading}
      supportImages={paramters?.supportImages}
      supportVoice={paramters?.supportVoice}
      customRequest={sendMsgRequest}
      onSend={() => {}}
      onStop={() => {}}
    >
      <div>
        <Space size={0} wrap className={styles.chatTags}>
          <span>{platform}</span>
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
          <ChatParamters
            data={data}
            paramters={paramters}
            setParamters={setParamters}
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
