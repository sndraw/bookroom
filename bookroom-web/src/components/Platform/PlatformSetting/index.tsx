import { useRequest } from '@umijs/max';
import { Space, Spin, Switch } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './index.less';
type PlatformSettingPropsType = {
  platform: string;
  customRequest: (params?: any) => Promise<any>;
  // 刷新
  refresh?: () => void;
  // 样式
  className?: string;
};
const PlatformSetting: React.FC<PlatformSettingPropsType> = (props) => {
  const { platform, customRequest, refresh, className } = props;
  // 平台信息-请求
  const { data, loading, run } = useRequest(
    () =>
      customRequest({
        id: platform,
      }),
    {
      manual: true,
      throwOnError: true,
    },
  );
  useEffect(() => {
    run();
  }, [platform]);

  if (!data || !platform) {
    return null;
  }
  return (
    <Spin tip="Loading..." spinning={loading}>
      <Space size={0} className={classNames(styles.container, className)}>
        {/* 添加平台 */}
        {/* <Button
          title="添加平台"
          icon={<PlusSquareOutlined />}
          key="addPlatform"
          type="text"
          onClick={() => {
            // run();
          }}
        ></Button> */}
        {platform && (
          <>
            {/* 启停模型 */}
            <Switch
              value={!!data?.status}
              onChange={(checked: boolean) => {}}
              checkedChildren="开启"
              unCheckedChildren="关闭"
              disabled
            />
            {/* 配置平台 */}
            {/* <Button
              icon={<SettingOutlined />}
              title="配置平台"
              key="editPlatform"
              type="text"
              onClick={() => {
                // run();
              }}
            ></Button> */}
            {/* 删除平台 */}
            {/* <Button
              title="删除平台"
              icon={<DeleteOutlined />}
              key="deletePlatform"
              type="text"
              danger
              onClick={() => {
                // run();
              }}
            ></Button> */}
          </>
        )}
      </Space>
    </Spin>
  );
};

export default PlatformSetting;
