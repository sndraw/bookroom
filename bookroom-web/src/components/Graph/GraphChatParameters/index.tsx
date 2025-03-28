import { AI_GRAPH_MODE_ENUM } from '@/common/ai';
import { SettingOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Flex,
  Select,
  Slider,
  Switch,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

export interface ParametersType {
  mode: AI_GRAPH_MODE_ENUM;
  onlyNeedContext: boolean;
  onlyNeedPrompt: boolean;
  topK: number;
  isStream: boolean;
}

export const defaultParameters: ParametersType = {
  mode: AI_GRAPH_MODE_ENUM.HYBRID,
  onlyNeedContext: false,
  onlyNeedPrompt: false,
  topK: 10,
  isStream: true,
};

interface ChatParametersProps {
  platform?: string;
  data?: any;
  parameters: any;
  changeParameters: (parameters: ParametersType) => void;
}

const ChatParameters: React.FC<ChatParametersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [mode, setMode] = useState<AI_GRAPH_MODE_ENUM>(
    AI_GRAPH_MODE_ENUM?.HYBRID,
  );
  const [onlyNeedContext, setOnlyNeedContext] = useState<boolean>(false);
  const [onlyNeedPrompt, setOnlyNeedPrompt] = useState<boolean>(false);
  const [topK, setTopK] = useState<number>(10);
  const [isStream, setIsStream] = useState<boolean>(true);

  const { platform, data, parameters, changeParameters } = props;

  useEffect(() => {
    if (parameters) {
      setMode(parameters.mode);
      setOnlyNeedContext(parameters.onlyNeedContext);
      setOnlyNeedPrompt(parameters.onlyNeedPrompt);
      setTopK(parameters.topK);
      setIsStream(parameters.isStream);
    }
  }, [parameters]);

  // 将AI_GRAPH_MODE_ENUM解析成options
  const modeOptions = () => {
    return Object.entries(AI_GRAPH_MODE_ENUM).map(([key, value]) => {
      return {
        label: value,
        value: value,
      };
    });
  };
  const handleSave = () => {
    const newParameters: ParametersType = {
      mode,
      onlyNeedContext,
      onlyNeedPrompt,
      topK,
      isStream,
    };
    changeParameters(newParameters);
  };
  return (
    <>
      <Button
        type="primary"
        ghost
        icon={<SettingOutlined />}
        onClick={() => setDrawerVisible(true)}
      >
        参数设置
      </Button>
      <Drawer
        title="参数设置"
        placement="right"
        open={drawerVisible}
        onClose={() => {
          handleSave();
          setDrawerVisible(false);
        }}
      >
        <div className={styles.formPanel}>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>模式：</label>
            <Select
              onChange={(value) => {
                setMode(value);
              }}
              options={modeOptions()}
              value={mode}
              defaultValue={mode}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>Top K：</label>
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
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>仅需上下文：</label>
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
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>仅需提示词：</label>
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
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>流式输出：</label>
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
        </div>
      </Drawer>
    </>
  );
};

export default ChatParameters;
