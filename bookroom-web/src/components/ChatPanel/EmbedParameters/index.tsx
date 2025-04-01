import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import { SettingOutlined } from '@ant-design/icons';
import { Access } from '@umijs/max';
import {
  Button,
  Drawer,
  Flex,
  InputNumber,
  Radio,
  Slider,
  Switch,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

export interface ParametersType {
  truncate: boolean;
  dimensions: number;
  encodingFormat: 'float' | 'base64';
}

export const defaultParameters: ParametersType = {
  truncate: true,
  dimensions: 1024,
  encodingFormat: 'float',
};

interface EmbedParametersProps {
  platform: string;
  data: any;
  parameters: any;
  changeParameters: (parameters: ParametersType) => void;
}

const EmbedParameters: React.FC<EmbedParametersProps> = (props) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [truncate, setTruncate] = useState<boolean>(true);
  const [dimensions, setDimensions] = useState<number>(10);
  const [encodingFormat, setEncodingFormat] = useState<'float' | 'base64'>('float');
  const { platform, data, parameters, changeParameters } = props;

  useEffect(() => {
    if (parameters) {
      setTruncate(parameters.truncate);
      setDimensions(parameters.dimensions);
      setEncodingFormat(parameters.encodingFormat);
    }
  }, [parameters]);

  const handleSave = () => {
    const newParameters: ParametersType = {
      truncate,
      dimensions,
      encodingFormat,
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
          <Access
            accessible={data?.platformCode === AI_LM_PLATFORM_MAP.ollama.value}
          >
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>文本截断：</label>
              <Switch
                value={truncate}
                onChange={(checked: boolean) => {
                  if (checked) {
                    setTruncate(false);
                  }
                  setTruncate(checked);
                }}
                checkedChildren="启用"
                unCheckedChildren="禁用"
              />
            </Flex>
          </Access>

          <Access
            accessible={data?.platformCode !== AI_LM_PLATFORM_MAP.ollama.value}
          >
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>向量维度：</label>
              <Slider
                style={{ width: 100 }}
                min={1}
                max={8192}
                onChange={(value: number | null) => {
                  if (value !== null) {
                    setDimensions(value);
                  }
                }}
                value={dimensions}
                tooltip={{ open: false }}
              />
              <InputNumber
                min={1}
                max={8192}
                style={{ marginLeft: 8 }}
                value={dimensions}
                onChange={(value: number | null) => {
                  if (value !== null) {
                    setDimensions(value);
                  }
                }}
              />
            </Flex>
          </Access>
          <Access
            accessible={data?.platformCode !== AI_LM_PLATFORM_MAP.ollama.value}
          >
            <Flex
              className={styles.formItem}
              justify="justifyContent"
              align="center"
            >
              <label className={styles.formLabel}>编码格式：</label>
              <Radio.Group
                onChange={(e) => {
                  setEncodingFormat(e.target.value);
                }}
                value={encodingFormat}
              >
                <Radio value="float">float</Radio>
                <Radio value="base64">base64</Radio>
              </Radio.Group>
            </Flex>
          </Access>
        </div>
      </Drawer>
    </>
  );
};

export default EmbedParameters;
