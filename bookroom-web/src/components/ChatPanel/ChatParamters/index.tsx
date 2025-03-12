import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Access } from '@umijs/max';
import {
  Button,
  Drawer,
  Flex,
  InputNumber,
  Slider,
  Switch,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

export interface ParamtersType {
  isStream: boolean;
  supportImages: boolean;
  supportVoice?: boolean;
  temperature: number;
  topK: number;
  topP: number;
  repeatPenalty?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxTokens: number;
}

export const defaultParamters: ParamtersType = {
  isStream: true,
  supportImages: true,
  supportVoice: true,
  temperature: 0.7,
  topK: 10,
  topP: 0.9,
  repeatPenalty: 1.1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 4096,
};

interface ChatParamtersProps {
  data: any;
  paramters: any;
  setParamters: (paramters: ParamtersType) => void;
}

const ChatParamters: React.FC<ChatParamtersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isStream, setIsStream] = useState<boolean>(true);
  const [supportImages, setSupportImages] = useState<boolean>(true);
  const [supportVoice, setSupportVoice] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topK, setTopK] = useState<number>(10);
  const [topP, setTopP] = useState<number>(0.9);
  const [repeatPenalty, setRepeatPenalty] = useState<number>(1.1);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0);
  const [presencePenalty, setPresencePenalty] = useState<number>(0);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const { token } = useToken();
  const { data, paramters, setParamters } = props;

  useEffect(() => {
    if (paramters) {
      setIsStream(paramters.isStream);
      setSupportImages(paramters.supportImages);
      setSupportVoice(paramters.supportVoice); // 这里需要修改为支持语音
      setTemperature(paramters.temperature);
      setTopK(paramters.topK);
      setTopP(paramters.topP);
      setRepeatPenalty(paramters.repeatPenalty);
      setFrequencyPenalty(paramters.frequencyPenalty);
      setPresencePenalty(paramters.presencePenalty);
      setMaxTokens(paramters.maxTokens);
    }
  }, [paramters]);

  const handleSave = () => {
    const newParamters: ParamtersType = {
      isStream,
      supportImages,
      supportVoice,
      temperature,
      topK,
      topP,
      repeatPenalty,
      frequencyPenalty,
      presencePenalty,
      maxTokens,
    };
    setParamters(newParamters);
  };
  const temperatureTip = <>
    建议根据如下场景设置，并参考模型文档或实际效果调整
    <br />
    通用对话：1.3
    <br />
    翻译：1.3
    <br />
    代码生成/数学解题：0.0
    <br />
    数据抽取/分析：1.0
  </>;

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
            <label className={styles.formLabel}>
              温度
              <Tooltip title={temperatureTip}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
              ：
            </label>
            <Slider
              style={{ width: 100 }}
              min={0}
              max={1}
              step={0.1}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setTemperature(value);
                }
              }}
              value={temperature}
              tooltip={{ open: false }}
            />
            <span style={{ marginLeft: 8 }}>{temperature}</span>
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>Top P：</label>
            <Slider
              style={{ width: 100 }}
              min={0}
              max={1}
              step={0.1}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setTopP(value);
                }
              }}
              value={topP}
              tooltip={{ open: false }}
            />
            <span style={{ marginLeft: 8 }}>{topP}</span>
          </Flex>
          <Access
            accessible={data?.platformCode !== AI_LM_PLATFORM_MAP.openai.value}
          >
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>Top K：</label>
              <Slider
                style={{ width: 100 }}
                min={1}
                max={100}
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
          </Access>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>输出长度：</label>
            <Slider
              style={{ width: 100 }}
              min={1}
              max={8192}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setMaxTokens(value);
                }
              }}
              value={maxTokens}
              tooltip={{ open: false }}
            />
            <InputNumber
              min={1}
              max={8192}
              style={{ marginLeft: 8 }}
              value={maxTokens}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setMaxTokens(value);
                }
              }}
            />
          </Flex>
          <Access
            accessible={data?.platformCode !== AI_LM_PLATFORM_MAP.openai.value}
          >
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>惩罚强度：</label>
              <Slider
                style={{ width: 100 }}
                min={-2}
                max={2}
                step={0.1}
                onChange={(value: number | null) => {
                  if (value !== null) {
                    setRepeatPenalty(value);
                  }
                }}
                value={repeatPenalty}
                tooltip={{ open: false }}
              />
              <span style={{ marginLeft: 8 }}>{repeatPenalty}</span>
            </Flex>
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>频率惩罚：</label>
              <Slider
                style={{ width: 100 }}
                min={-2}
                max={2}
                step={0.1}
                onChange={(value: number | null) => {
                  if (value !== null) {
                    setFrequencyPenalty(value);
                  }
                }}
                value={frequencyPenalty}
                tooltip={{ open: false }}
              />
              <span style={{ marginLeft: 8 }}>{frequencyPenalty}</span>
            </Flex>
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>存在惩罚：</label>
              <Slider
                style={{ width: 100 }}
                min={-2}
                max={2}
                step={0.1}
                onChange={(value: number | null) => {
                  if (value !== null) {
                    setPresencePenalty(value);
                  }
                }}
                value={presencePenalty}
                tooltip={{ open: false }}
              />
              <span style={{ marginLeft: 8 }}>{presencePenalty}</span>
            </Flex>
          </Access>
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
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>图片上传：</label>
            <Switch
              value={supportImages}
              onChange={(checked: boolean) => {
                if (checked) {
                  setSupportImages(false);
                }
                setSupportImages(checked);
              }}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>语音输入：</label>
            <Switch
              value={supportVoice}
              onChange={(checked: boolean) => {
                if (checked) {
                  setSupportVoice(false);
                }
                setSupportVoice(checked);
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

export default ChatParamters;
