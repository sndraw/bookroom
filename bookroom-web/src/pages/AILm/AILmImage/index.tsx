import ChatPanel from '@/components/ChatPanel';
import Page404 from '@/pages/404';
import { AILmImage, getAILmInfo } from '@/services/common/ai/lm';
import { Access, useAccess, useModel, useParams, useRequest } from '@umijs/max';
import { Divider, Flex, Space, Switch, Tag } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const AILmImagePage: React.FC = () => {
  const access = useAccess();
  const { platform, model } = useParams();
  const [isStream, setIsStream] = useState<boolean>(true);
  const [supportImages, setSupportImages] = useState<boolean>(true);
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

  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    const prompt = messages[messages.length - 1]?.content || '';

    return await AILmImage(
      {
        platform: platform || '',
        model: encodeURIComponent(model || ''),
        is_stream: isStream,
      },
      {
        model: model || '',
        prompt: prompt,
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
      // supportImages={supportImages}
      customRequest={sendMsgRequest}
      onSend={() => { }}
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
        </Space>
        <Space size={16} wrap className={styles.formPanel}>
          <Flex justify="center" align="center">
            <label>流式输出：</label>
            <Switch
              value={isStream}
              onChange={(checked: boolean) => {
                if (checked) {
                  setIsStream(false);
                }
                setIsStream(checked);
              }}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>
        </Space>
      </div>
    </ChatPanel>
  );
};

export default AILmImagePage;
