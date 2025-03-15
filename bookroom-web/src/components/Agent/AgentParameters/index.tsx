import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Access, useModel } from '@umijs/max';
import {
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

export interface ParametersType {
  isStream: boolean;
  searchEngine?: string;
}

export const defaultParameters: ParametersType = {
  isStream: true,
  searchEngine: undefined
};

interface AgentParametersProps {
  data: any;
  parameters: any;
  changeParameters: (parameters: ParametersType) => void;
}

const AgentParameters: React.FC<AgentParametersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isStream, setIsStream] = useState<boolean>(true);
  const [searchEngine, setSearchEngine] = useState<string>();

  const { data, parameters, changeParameters } = props;
  const { token } = useToken();

  const { searchEngineList } = useModel('searchengineList');

  useEffect(() => {
    if (parameters) {
      setIsStream(parameters.isStream);
      setSearchEngine(parameters.searchEngine);
    }
  }, [parameters]);

  const handleSave = () => {
    const newParameters: ParametersType = {
      isStream,
      searchEngine,
    };
    changeParameters(newParameters);
  };

  const searchEngineOptions = () => {
    return searchEngineList?.map((item: any) => {
      return { value: item.id, label: item.name };
    });
  }

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
            <label className={styles.formLabel} >搜索引擎：</label>
            <Select
              options={searchEngineOptions()}
              placeholder="请选择引擎类型"
              value={searchEngine}
              onChange={(value) => {
                setSearchEngine(value);
              }}
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

export default AgentParameters;
