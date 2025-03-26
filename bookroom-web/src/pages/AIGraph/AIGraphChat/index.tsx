import { AI_GRAPH_MODE_ENUM } from '@/common/ai';
import ChatPanel from '@/components/ChatPanel';
import Page404 from '@/pages/404';
import { graphChat } from '@/services/common/ai/graph';
import { useModel, useParams } from '@umijs/max';
import { Divider, Flex, Radio, Slider, Space, Switch } from 'antd';
import { useState } from 'react';
import styles from './index.less';

const AIGraphChatPage: React.FC = () => {
  const { graph, workspace } = useParams();

  const [mode, setMode] = useState<AI_GRAPH_MODE_ENUM>(
    AI_GRAPH_MODE_ENUM?.HYBRID,
  );
  const [onlyNeedContext, setOnlyNeedContext] = useState<boolean>(false);
  const [onlyNeedPrompt, setOnlyNeedPrompt] = useState<boolean>(false);
  const [topK, setTopK] = useState<number>(10);
  const [isStream, setIsStream] = useState<boolean>(true);
  const { getGraphName } = useModel('graphList');

  // 将AI_GRAPH_MODE_ENUM解析成options
  const modeOptions = () => {
    return Object.entries(AI_GRAPH_MODE_ENUM).map(([key, value]) => {
      return {
        label: value,
        value: value,
      };
    });
  };

  if (!graph || !workspace) {
    return <Page404 title={'非法访问'} />;
  }

  // 发送
  const sendMsgRequest = async (data: any, options: any) => {
    const { messages } = data || {};
    return await graphChat(
      {
        graph: graph,
        workspace: workspace,
        is_stream: isStream,
      },
      {
        format: '',
        mode: mode,
        top_k: topK,
        query: messages[messages?.length - 1]?.content,
        only_need_context: onlyNeedContext,
        only_need_prompt: onlyNeedPrompt,
      },
      {
        ...(options || {}),
      },
    );
  };
  return (
    <ChatPanel
      className={styles?.pageContainer}
      customRequest={sendMsgRequest}
      onSend={() => {}}
      onStop={() => {}}
      onClear={() => {}}
    >
      <div>
        <Space size={0} wrap className={styles.chatTags}>
          <span>{getGraphName(graph)}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.chatTitle}>
          <span>{workspace}</span>
        </Space>
        <Space size={16} wrap className={styles.formPanel}>
          {/* flex 垂直居中 */}
          <Flex justify="center" align="center">
            <label>模式：</label>
            <Radio.Group
              block
              optionType="button"
              buttonStyle="solid"
              onChange={(event) => {
                setMode(event?.target.value);
              }}
              options={modeOptions()}
              value={mode}
              defaultValue={mode}
            />
          </Flex>
          <Flex justify="center" align="center">
            <label>Top K：</label>
            <Slider
              style={{ width: 100 }}
              min={1}
              max={60}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setTopK(value);
                }
              }}
              value={topK}
              tooltip={{ open: false }}
            />
            <span style={{ marginLeft: 8 }}>{topK}</span>
          </Flex>
          <Flex justify="center" align="center">
            <label>仅需上下文：</label>
            <Switch
              value={onlyNeedContext}
              onChange={(checked: boolean) => {
                if (checked) {
                  setOnlyNeedPrompt(false);
                }
                setOnlyNeedContext(checked);
              }}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </Flex>
          <Flex justify="center" align="center">
            <label>仅需提示词：</label>
            <Switch
              value={onlyNeedPrompt}
              onChange={(checked: boolean) => {
                if (checked) {
                  setOnlyNeedContext(false);
                }
                setOnlyNeedPrompt(checked);
              }}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </Flex>
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

export default AIGraphChatPage;
