import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Drawer,
  Flex,
  Input,
  Select,
  Switch,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import SearchEngineSelect from '@/components/Search/SearchEngineSelect';
import AgentModelSelect from './AgentModelSelect/inex';
import AgentGraphSelect from './AgentGraphSelect/inex';

export interface ParametersType {
  prompt: string;
  isStream: boolean;
  searchEngine?: string;
  modelConfig?: object;
  graphConfig?: object;
}

export const defaultParameters: ParametersType = {
  prompt: '',
  isStream: true,
  searchEngine: undefined,
  modelConfig: undefined,
  graphConfig: undefined,
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
  const [searchEngine, setSearchEngine] = useState<string>();
  const [modelConfig, setModelConfig] = useState<object>();
  const [graphConfig, setGraphConfig] = useState<object>();
  const { data, parameters, changeParameters } = props;
  const { token } = useToken();

  useEffect(() => {
    if (parameters) {
      setPrompt(parameters?.prompt);
      setIsStream(parameters?.isStream);
      setSearchEngine(parameters?.searchEngine);
      setModelConfig(parameters?.modelConfig);
      setGraphConfig(parameters?.graphConfig);
    }
  }, [parameters]);

  const handleSave = () => {
    const newParameters: ParametersType = {
      prompt,
      isStream,
      searchEngine,
      modelConfig,
      graphConfig,
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
            <label className={styles.formLabel} >工具模型<Tooltip title={"平台及模型需要支持工具调用"}>
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
              value={searchEngine}
              onChange={(value: string) => setSearchEngine(value)}
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
