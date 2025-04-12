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
import AudioParamsSelect, { AudioParamsType } from '@/components/Voice/AudioParamsSelect';
export interface ParametersType {
  prompt: string;
  isConvertFile: boolean;
  isStream: boolean;
  voiceParams?: API.VoiceParamsType;
  audioParams?: AudioParamsType;
  logLevel: boolean;
  isMemory: boolean;
  storageEngine: boolean;
  searchEngine?: string | string[];
  weatherEngine?: string;
  modelConfig?: object;
  graphConfig?: object;
  agentSDK?: string | string[];
  limitSeconds: number;
  limitSteps: number;
  maxTokens: number;
}

export const defaultParameters: ParametersType = {
  prompt: '',
  isConvertFile: true,
  isStream: true,
  logLevel: true,
  isMemory: false,
  audioParams: undefined,
  voiceParams: undefined,
  storageEngine: false,
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
  const [isConvertFile, setIsConvertFile] = useState<boolean>(true);
  const [isStream, setIsStream] = useState<boolean>(true);
  const [audioParams, setAudioParams] = useState<any>(false);
  const [voiceParams, setVoiceParams] = useState<any>(false);
  const [logLevel, setLogLevel] = useState<boolean>(true);
  const [isMemory, setIsMemory] = useState<boolean>(false);
  const [storageEngine, setStorageEngine] = useState<boolean>(false);
  const [searchEngine, setSearchEngine] = useState<string | string[]>();
  const [weatherEngine, setWeatherEngine] = useState<string>();
  const [modelConfig, setModelConfig] = useState<object>();
  const [graphConfig, setGraphConfig] = useState<object>();
  const [agentSDK, setAgentSDK] = useState<string | string[]>();
  const [limitSeconds, setLimitSeconds] = useState<number>(30);
  const [limitSteps, setLimitSteps] = useState<number>(5);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const { data, parameters, changeParameters } = props;
  const { token } = useToken();

  useEffect(() => {
    if (parameters) {
      setPrompt(parameters?.prompt);
      setIsConvertFile(parameters?.isConvertFile);
      setIsStream(parameters?.isStream);
      setAudioParams(parameters?.audioParams);
      setVoiceParams(parameters?.voiceParams);
      setLogLevel(parameters?.logLevel);
      setIsMemory(parameters?.isMemory);
      setStorageEngine(parameters?.storageEngine);
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
      isConvertFile,
      isStream,
      audioParams,
      voiceParams,
      logLevel,
      isMemory,
      storageEngine,
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
            <label className={styles.formLabel} >工具模型
              <Tooltip title={<>平台及模型需要支持工具调用<br />目前仅兼容OpenAI接口类型</>}>
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
              mode={"multiple"}
              value={searchEngine}
              onChange={(value: string | string[]) => setSearchEngine(value)}
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
            <label className={styles.formLabel} >智能接口
              <Tooltip title={() => {
                return <span>
                  通过该接口获取额外的上下文数据、工具，也可配置自定义智能体
                  <br />当前Agent API接口类型已支持LightRag对话
                  <br />其他接口类型正在完善中...
                </span>
              }}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip></label>
            <AgentSDKSelect
              className={styles.selectElement}
              mode={"multiple"}
              value={agentSDK}
              onChange={(value: string | string[]) => setAgentSDK(value)}
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>存储引擎
              <Tooltip title={"开启后，智能体可以访问文件系统和网络资源，但会消耗额外的计算资源，不需要时建议关闭"}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
            </label>
            <Switch
              value={storageEngine}
              onChange={setStorageEngine}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>
              记忆模式
              <Tooltip title={"开启后，智能体可以访问历史对话，但会消耗额外的计算资源，不需要时建议关闭"}>
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
          <Flex
            className={styles.formItem}
            justify="justifyContent"
            align="center"
          >
            <label className={styles.formLabel}>任务日志
              <Tooltip title={"开启后，智能体将输出任务执行日志，便于调试和监控"}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
            </label>
            <Switch
              value={logLevel}
              onChange={setLogLevel}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Flex>
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
            <label className={styles.formLabel}>流式输出</label>
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
            <label className={styles.formLabel}>步骤限制
              <Tooltip title={"为了防止智能体陷入无限循环，消耗额外的计算资源，建议设置一个合理的步骤限制。"}>
                <QuestionCircleOutlined
                  style={{ marginLeft: 4, color: token.colorLink }}
                />
              </Tooltip>
            </label>
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
            <label className={styles.formLabel}>输出长度</label>
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
