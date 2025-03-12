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

export interface ParamtersType {
  isStream: boolean;
  searchEngine?: string;
}

export const defaultParamters: ParamtersType = {
  isStream: true,
  searchEngine: undefined
};

interface AgentParamtersProps {
  data: any;
  paramters: any;
  setParamters: (paramters: ParamtersType) => void;
}

const AgentParamters: React.FC<AgentParamtersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isStream, setIsStream] = useState<boolean>(true);
  const [searchEngine, setSearchEngine] = useState<string>();

  const { data, paramters, setParamters } = props;
  const { token } = useToken();

  const { searchEngineList } = useModel('searchengineList');

  useEffect(() => {
    if (paramters) {
      setIsStream(paramters.isStream);
      setSearchEngine(paramters.searchEngine);
    }
  }, [paramters]);

  const handleSave = () => {
    const newParamters: ParamtersType = {
      isStream,
      searchEngine,
    };
    setParamters(newParamters);
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

export default AgentParamters;
