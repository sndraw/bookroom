import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import PlatformSelect from '@/components/Platform/PlatformSelect';
// import PlatformSetting from '@/components/Platform/PlatformSetting';
import { MODE_ENUM, STATUS_MAP } from '@/constants/DataMap';
import { deleteAILm, pullAILm, runAILm } from '@/services/common/ai/lm';
import { getPlatformInfo } from '@/services/common/platform';
import { ReloadOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Access, Outlet, useAccess, useRequest } from '@umijs/max';
import { FloatButton, Input, Select, Space } from 'antd';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LmPull from '../LmPull';
import LmCard from '../LmCard';
import styles from './index.less';
import useHeaderHeight from '@/hooks/useHeaderHeight';

type LmListPropsType = {
  mode?: MODE_ENUM;
  platformList: API.PlatformInfo[] | null;
  platform: string;
  changePlatform: (platform: string) => void;
  dataList: any;
  loading: any;
  refresh: () => void;
  className?: string;
  children?: React.ReactNode;
};
const LmList: React.FC<LmListPropsType> = (props) => {
  const [searchText, setSearchText] = useState<string>('' as string);
  const [lmStatus, setLmStatus] = useState<number | null>(null);
  const {
    mode = MODE_ENUM.VIEW,
    platformList,
    platform,
    changePlatform,
    dataList,
    loading,
    refresh,
    className,
  } = props;

  // 模型列表-请求
  const {
    data: platformInfo,
    loading: platformLoading,
    run: platformRun,
  } = useRequest(
    () => {
      return getPlatformInfo({
        platform,
      });
    },
    {
      manual: true,
    },
  );
  const headerHeight = useHeaderHeight();

  // 计算样式
  const containerStyle = useCallback(() => {
    return {
      height: `calc(100vh - ${headerHeight + 40}px)`,
    };
  }, [headerHeight]);

  const filterData = useMemo(() => {
    const newDataList = [
      ...(dataList || [])
    ]
    // // 按运行状态排序
    // newDataList.sort((a, b) => {
    //   if (a.status === b.status) {
    //     return 0;
    //   } else if (a.status === STATUS_MAP.DISABLE.value) {
    //     return 1;
    //   } else {
    //     return -1;
    //   }
    // });
    if (!searchText && !lmStatus) return newDataList;
    return newDataList?.filter((item: any) => {
      let flag = true;
      if (searchText) {
        flag = flag && item.name?.includes(searchText)
      }
      if (lmStatus) {
        flag = flag && item.status === lmStatus
      }
      return flag
    });
  }, [dataList, searchText, lmStatus]);

  useEffect(() => {
    if (platform) {
      platformRun();
    }
  }, [platform]);

  const access = useAccess();

  const canEdit = access.canSeeDev && mode === MODE_ENUM.EDIT;

  const isLoading = !!loading || platformLoading;

  return (
    <div className={classNames(styles.container, className)} style={containerStyle()}>
      <Space size={16} wrap className={styles.header}>
        <PlatformSelect
          title={'模型平台'}
          dataList={platformList}
          platform={platform}
          changePlatform={changePlatform}
          allowClear={false}
        />
        {/* 筛选模型 */}
        <Input.Search
          allowClear
          placeholder={'搜索模型'}
          defaultValue={searchText}
          onSearch={(value) => {
            setSearchText(value);
          }}
        />
        {/* 运行状态 */}
        <Select
          className={styles.selectElement}
          value={lmStatus}
          allowClear
          placeholder={'运行状态'}
          onChange={(value) => {
            setLmStatus(value);
          }}
          options={[
            {
              label: STATUS_MAP.ENABLE.text,
              value: STATUS_MAP.ENABLE.value,
            },
            {
              label: STATUS_MAP.DISABLE.text,
              value: STATUS_MAP.DISABLE.value,
            }
          ]}
        />
        <FloatButton.Group key={'addLmGroup'}>
          <Access
            accessible={
              canEdit &&
              platformInfo?.code === AI_LM_PLATFORM_MAP?.ollama.value
            }
            key="addLmAccess"
          >
            {platform && (
              <LmPull
                platform={platform}
                pullItem={pullAILm}
                refresh={refresh}
              />
            )}
          </Access>
          <FloatButton
            tooltip="刷新"
            icon={<ReloadOutlined />}
            key="refresh"
            onClick={() => {
              refresh();
            }}
          ></FloatButton>
        </FloatButton.Group>
        {/* <Divider type="vertical" /> */}
        {/* <Access accessible={false}>
              <PlatformSetting
                platform={platform}
                customRequest={getPlatformInfo}
                refresh={refresh}
              />
            </Access> */}
      </Space>
      <ProList
        ghost={true}
        className={styles.cardList}
        rowSelection={{}}
        itemCardProps={{
          ghost: false,
        }}
        virtual
        pagination={{
          style: {
            position: 'fixed',
            bottom: '10px',
            right: '30px',
          },
          size: 'small',
          pageSize: 9,
          showSizeChanger: true,
          total: filterData?.length,
        }}
        grid={{
          gutter: [24, 12],
          column: 4,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 4,
        }}
        loading={isLoading}
        dataSource={filterData}
        itemLayout="horizontal"
        renderItem={(item: any) => (
          <div className={styles.listItem} key={item.id}>
            <LmCard
              mode={mode}
              refresh={() => {
                refresh();
              }}
              runItem={runAILm}
              deleteItem={deleteAILm}
              key={item.name}
              item={item}
            />
          </div>
        )}
      />
      <Outlet />
    </div>
  );
};

export default LmList;
