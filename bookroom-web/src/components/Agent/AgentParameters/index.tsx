import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Drawer,
  Flex,
  Input,
  InputNumber,
  Slider,
  Switch,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import SearchEngineSelect from '@/components/Search/SearchEngineSelect';
import AgentModelSelect from './AgentModelSelect/inex';
import AgentGraphSelect from './AgentGraphSelect/inex';
import AgentSDKSelect from './AgentSDKSelect/inex';
import { SEARCH_API_MAP } from '@/common/search';
import VoiceRecognizeSelect from '@/components/Voice/VoiceRecognizeSelect';

export interface ParametersType {
  prompt: string;
  isStream: boolean;
  isImages: boolean;
  voiceParams?: API.VoiceParametersType;
  logLevel: boolean;
  isMemory: boolean;
  searchEngine?: string;
  weatherEngine?: string;
  modelConfig?: object;
  graphConfig?: object;
  agentSDK?: string;
  limitSeconds: number;
  limitSteps: number;
  maxTokens: number;
}

export const defaultParameters: ParametersType = {
  prompt: '',
  isStream: true,
  isImages: true,
  voiceParams: null,
  logLevel: false,
  isMemory: false,
  searchEngine: undefined,
  weatherEngine: undefined,
  modelConfig: undefined,
  graphConfig: undefined,
  agentSDK: undefined,
  limitSeconds: 30,
  limitSteps: 5,
  maxTokens: 4096,
};

interface AgentParametersProps {
  data: any;
  parameters: any;
  changeParameters: (parameters: ParametersType) => void;
}

const AgentParameters: React.FC<AgentParametersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [isStream, setIsStream] = useState<boolean>(true);
  const [isImages, setIsImages] = useState<boolean>(true);
  const [voiceParams, setVoiceParams] = useState<any>(false);
  const [logLevel, setLogLevel] = useState<boolean>(false);
  const [isMemory, setIsMemory] = useState<boolean>(false);
  const [searchEngine, setSearchEngine] = useState<string>();
  const [weatherEngine, setWeatherEngine] = useState<string>();
  const [modelConfig, setModelConfig] = useState<object>();
  const [graphConfig, setGraphConfig] = useState<object>();
  const [agentSDK, setAgentSDK] = useState<string>();
  const [limitSeconds, setLimitSeconds] = useState<number>(30);
  const [limitSteps, setLimitSteps] = useState<number>(5);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const { data, parameters, changeParameters } = props;
  const { token } = useToken();

  useEffect(() => {
    if (parameters) {
      setPrompt(parameters?.prompt);
      setIsStream(parameters?.isStream);
      setIsImages(parameters.isImages);
      setVoiceParams(parameters.voiceParams);
      setLogLevel(parameters?.logLevel);
      setIsMemory(parameters?.isMemory);
      setSearchEngine(parameters?.searchEngine);
      setWeatherEngine(parameters?.weatherEngine);
      setModelConfig(parameters?.modelConfig);
      setGraphConfig(parameters?.graphConfig);
      setAgentSDK(parameters?.agentSDK);
      setLimitSeconds(parameters?.limitSeconds);
      setLimitSteps(parameters?.limitSteps);
      setMaxTokens(parameters?.maxTokens);
    }
  }, [parameters]);

  const handleSave = () => {
    const newParameters: ParametersType = {
      prompt,
      isStream,
      isImages,
      voiceParams,
      logLevel,
      isMemory,
      searchEngine,
      weatherEngine,
      modelConfig,
      graphConfig,
      agentSDK,
      limitSeconds,
      limitSteps,
      maxTokens,
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
            align="top"
          >
            <label className={styles.formLabel} >工具模型<Tooltip title={<>平台及模型需要支持工具调用<br />目前仅兼容OpenAI接口类型</>}>
              <QuestionCircleOutlined
                style={{ marginLeft: 4, color: token.colorLink }}
              />
            </Tooltip></label>
            <AgentModelSelect
              className={styles.selectElement}
              values={modelConfig}
              onChange={(values: object) => setModelConfig(values)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="top"
          >
            <label className={styles.formLabel} >知识图谱</label>
            <AgentGraphSelect
              className={styles.selectElement}
              values={graphConfig}
              onChange={(values: object) => setGraphConfig(values)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel} >搜索引擎</label>
            <SearchEngineSelect
              className={styles.selectElement}
              value={searchEngine}
              onChange={(value: string) => setSearchEngine(value)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel} >天气搜索</label>
            <SearchEngineSelect
              className={styles.selectElement}
              placeholder="请选择天气搜索"
              searchCode={SEARCH_API_MAP.weather.value}
              value={weatherEngine}
              onChange={(value: string) => setWeatherEngine(value)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel} >智能接口<Tooltip title={"通过该接口获取额外的上下文数据及工具"}>
              <QuestionCircleOutlined
                style={{ marginLeft: 4, color: token.colorLink }}
              />
            </Tooltip></label>
            <AgentSDKSelect
              className={styles.selectElement}
              value={agentSDK}
              onChange={(value: string) => setAgentSDK(value)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>日志输出</label>
            <Switch
              value={logLevel}
              onChange={(checked: boolean) => {
                if (checked) {
                  setLogLevel(false);
                }
                setLogLevel(checked);
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
            <label className={styles.formLabel}>记忆模式</label>
            <Switch
              value={isMemory}
              onChange={(checked: boolean) => {
                if (checked) {
                  setIsMemory(false);
                }
                setIsMemory(checked);
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
            <label className={styles.formLabel}>流式输出</label>
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
            <label className={styles.formLabel}>图片上传</label>
            <Switch
              value={isImages}
              onChange={(checked: boolean) => {
                if (checked) {
                  setIsImages(false);
                }
                setIsImages(checked);
              }}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="top"
          >
            <label className={styles.formLabel}>语音输入</label>
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
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>步骤限制</label>
            <Slider
              style={{ width: 100 }}
              min={1}
              max={100}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setLimitSteps(value);
                }
              }}
              value={limitSteps}
              tooltip={{ open: false }}
            />
            <InputNumber
              min={1}
              max={100}
              style={{ marginLeft: 8 }}
              value={limitSteps}
              onChange={(value: number | null) => {
                if (value !== null) {
                  setLimitSteps(value);
                }
              }}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>输出长度/步</label>
            <Slider
              style={{ width: 100 }}
              min={512}
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
              min={512}
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
            vertical
            justify="justifyContent"
            align="top"
          >
            <Divider orientation="center" plain>
              追加提示词<Tooltip title={"如无追加提示词，模型将根据用户的指令和自己的理解来决定工具调用"}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
            </Divider>
            <Input.TextArea
              className={styles.textAreaInput}
              placeholder={'请输入提示词'}
              value={prompt}
              maxLength={1024}
              showCount
              onChange={(event) => {
                setPrompt(event.target.value);
              }}
              rows={3}
            />
          </Flex>
        </div>
      </Drawer>
    </>
  );
};

export default AgentParameters;
