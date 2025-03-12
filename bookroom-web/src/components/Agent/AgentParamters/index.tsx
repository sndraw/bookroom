import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Access } from '@umijs/max';
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
  searchConfig: any;
}

export const defaultParamters: ParamtersType = {
  isStream: true,
  searchConfig: {
    url: 'http://baidu.com/search',
    engine: 'baidu',
    apiKey: '',
  }
};

interface AgentParamtersProps {
  data: any;
  paramters: any;
  setParamters: (paramters: ParamtersType) => void;
}

const AgentParamters: React.FC<AgentParamtersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isStream, setIsStream] = useState<boolean>(true);
  // const [searchUrl, setSearchUrl] = useState<string>();
  // const [searchEngine, setSearchEngine] = useState<string>();
  // const [searchApiKey, setSearchApiKey] = useState<string>();
  // const [searchParams, setSearchParams] = useState<any>({});
  const [searchConfig, setSearchConfig] = useState<any>({});

  const { data, paramters, setParamters } = props;
  const { token } = useToken();

  useEffect(() => {
    if (paramters) {
      setIsStream(paramters.isStream);
      setSearchConfig(paramters.searchConfig);
    }
  }, [paramters]);

  const handleSave = () => {
    const newParamters: ParamtersType = {
      isStream,
      searchConfig
    };
    setParamters(newParamters);
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
            vertical
            justify="justifyContent"
          >
            <label className={styles.formLabel} >搜索引擎：</label>
            <Space wrap direction={"vertical"} className={styles.formItemList}>
              <Form.Item colon={false}>
                <Input
                  min={1}
                  max={255}
                  value={searchConfig?.url}
                  placeholder="请输入搜索引擎地址"
                  onChange={(e) => {
                    setSearchConfig({
                      ...searchConfig,
                      url: e.target.value
                    });
                  }}
                />
              </Form.Item>
              <Form.Item colon={false}>
                <Select
                  options={[
                    { value: 'baidu', label: 'Baidu' },
                    { value: 'google', label: 'Google' },
                  ]}
                  placeholder="请选择引擎类型"
                  value={searchConfig?.engine}
                  onChange={(value) => {
                    setSearchConfig({
                      ...searchConfig,
                      engine: value
                    });
                  }}
                />
              </Form.Item>
              <Form.Item colon={false}>
                <Input.Password
                  min={1}
                  max={255}
                  value={searchConfig?.apiKey}
                  placeholder="请输入API Key"
                  onChange={(e) => {
                    setSearchConfig({
                      ...searchConfig,
                      apiKey: e.target.value
                    });
                  }}
                />
              </Form.Item>
            </Space>
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
