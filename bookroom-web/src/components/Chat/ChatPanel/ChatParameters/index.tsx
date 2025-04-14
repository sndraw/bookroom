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
import VoiceRecognizeSelect from '@/components/Voice/VoiceRecognizeSelect';
import AudioParamsSelect, { AudioParamsType } from '@/components/Voice/AudioParamsSelect';
import { CHAT_TYPE } from '@/common/chat';

export interface ParametersType {
  isStream: boolean;
  isMemory: boolean;
  isConvertFile: boolean;
  audioParams?: AudioParamsType;
  voiceParams?: API.VoiceParamsType;
  temperature: number;
  topK: number;
  topP: number;
  repeatPenalty: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  limitSeconds: number;
}

export const defaultParameters: ParametersType = {
  isStream: true,
  isMemory: true,
  isConvertFile: true,
  audioParams: undefined,
  voiceParams: undefined,
  temperature: 0.7,
  topK: 10,
  topP: 0.9,
  repeatPenalty: 1.1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 4096,
  limitSeconds: 30,
};

interface ChatParametersProps {
  platform: string;
  chatType: CHAT_TYPE;
  parameters: ParametersType;
  changeParameters: (parameters: ParametersType) => void;
}

const ChatParameters: React.FC<ChatParametersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isStream, setIsStream] = useState<boolean>(true);
  const [isMemory, setIsMemory] = useState<boolean>(true);
  const [isConvertFile, setIsConvertFile] = useState<boolean>(true);
  const [audioParams, setAudioParams] = useState<any>(false);
  const [voiceParams, setVoiceParams] = useState<any>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topK, setTopK] = useState<number>(10);
  const [topP, setTopP] = useState<number>(0.9);
  const [repeatPenalty, setRepeatPenalty] = useState<number>(1.1);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0);
  const [presencePenalty, setPresencePenalty] = useState<number>(0);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [limitSeconds, setLimitSeconds] = useState<number>(30);
  const { token } = useToken();
  const { chatType, parameters, changeParameters } = props;

  useEffect(() => {
    if (parameters) {
      setIsStream(parameters.isStream);
      setIsMemory(parameters.isMemory);
      setIsConvertFile(parameters.isConvertFile);
      setAudioParams(parameters.audioParams);
      setVoiceParams(parameters.voiceParams);
      setTemperature(parameters.temperature);
      setTopK(parameters.topK);
      setTopP(parameters.topP);
      setRepeatPenalty(parameters.repeatPenalty);
      setFrequencyPenalty(parameters.frequencyPenalty);
      setPresencePenalty(parameters.presencePenalty);
      setMaxTokens(parameters.maxTokens);
      setLimitSeconds(parameters.limitSeconds);
    }
  }, [parameters]);

  const handleSave = () => {
    const newParameters: ParametersType = {
      isStream,
      isMemory,
      isConvertFile,
      audioParams,
      voiceParams,
      temperature,
      topK,
      topP,
      repeatPenalty,
      frequencyPenalty,
      presencePenalty,
      maxTokens,
      limitSeconds,
    };
    changeParameters(newParameters);
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
          <Access
            accessible={chatType === CHAT_TYPE.CHAT}
          >
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>
                记忆模式
                <Tooltip title={"开启后，模型可以访问历史对话，但会消耗额外的计算资源，不需要时建议关闭"}>
                  <QuestionCircleOutlined
                    style={{ marginLeft: 4, color: token.colorLink }}
                  />
                </Tooltip>
              </label>
              <Switch
                value={isMemory}
                onChange={setIsMemory}
                checkedChildren="启用"
                unCheckedChildren="禁用"
              />
            </Flex>
          </Access>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>
              转换文件
              <Tooltip title={<>开启后，会在后台将文件转换为文件流传给模型，因此会消耗额外的计算资源。<br />建议在智能助手中将该功能关闭，由智能助手调用工具按需转换，以节省计算资源。</>}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
            </label>
            <Switch
              value={isConvertFile}
              onChange={setIsConvertFile}
              checkedChildren="启用"
              unCheckedChildren="禁用"
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
              onChange={setIsStream}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="top"
          >
            <label className={styles.formLabel}>音频输出
              <Tooltip title={"开启后，允许模型输出音频"}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
            </label>
            <AudioParamsSelect
              className={styles.formSelect}
              value={audioParams}
              onChange={(value: any) => {
                setAudioParams(value);
              }}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="top"
          >
            <label className={styles.formLabel}>语音输入：</label>
            <VoiceRecognizeSelect
              className={styles.formSelect}
              value={voiceParams}
              onChange={(value: any) => {
                setVoiceParams(value);
              }}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>超时设置(秒)</label>
            <Slider
              style={{ width: 100 }}
              min={10}
              max={3600}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setLimitSeconds(value);
                }
              }}
              value={limitSeconds}
              tooltip={{ open: false }}
            />
            <InputNumber
              min={10}
              max={3600}
              style={{ marginLeft: 8 }}
              value={limitSeconds}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setLimitSeconds(value);
                }
              }}
            />
          </Flex>
        </div>
      </Drawer>
    </>
  );
};

export default ChatParameters;
