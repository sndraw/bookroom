import { MODE_ENUM } from '@/constants/DataMap';
import { ReloadOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Access, Outlet, useAccess, useModel } from '@umijs/max';
import { Divider, FloatButton, Input, Space } from 'antd';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import AgentPlatformSelect from '../AgentPlatformSelect';
import AgentCard from '../AgentCard';
import styles from './index.less';
import useHeaderHeight from '@/hooks/useHeaderHeight';

type AgentListPropsType = {
  mode?: MODE_ENUM;
  platform?: string;
  changePlatform?: (newPlatform: string) => void;
  dataList?:API.AgentInfo[];
  loading: any;
  refresh: () => void;
  className?: string;
  children?: React.ReactNode;
};
const AgentList: React.FC<AgentListPropsType> = (props) => {
  const [searchText, setSearchText] = useState<string>('' as string);
  const {
    mode = MODE_ENUM.VIEW,
    platform,
    changePlatform,
    dataList,
    loading,
    refresh,
    className,
  } = props;

  const headerHeight = useHeaderHeight();

  // 计算样式
  const containerStyle = useCallback(() => {
    return {
      height: `calc(100vh - ${headerHeight + 40}px)`,
    };
  }, [headerHeight]);

  const filterData = useMemo(() => {
    if (!searchText) return dataList;
    return dataList?.filter((item: any) => item.name?.toLowerCase()?.includes(searchText?.toLowerCase()));
  }, [dataList, searchText]);


  const access = useAccess();

  const canEdit = access.canSeeDev && mode === MODE_ENUM.EDIT;

  const isLoading = !!loading;

  return (
    <div className={classNames(styles.container, className)} style={containerStyle()}>
      <Space size={16} wrap className={styles.header}>
        <AgentPlatformSelect
          title={'智能助手'}
          platform={platform}
          changePlatform={changePlatform}
          allowClear={false}
        />
        <Divider type="vertical" />
        {/* 筛选Agent */}
        <Input.Search
          allowClear
          placeholder={'搜索Agent'}
          defaultValue={searchText}
          onSearch={(value) => {
            setSearchText(value);
          }}
        />
        <FloatButton.Group key={'addAgentWorkspaceGroup'}>
          <FloatButton
            tooltip="刷新"
            icon={<ReloadOutlined />}
            key="refresh"
            onClick={() => {
              refresh();
            }}
          ></FloatButton>
        </FloatButton.Group>
      </Space>
      <ProList
        ghost={true}
        className={styles.cardList}
        rowSelection={{}}
        itemCardProps={{
          ghost: false,
        }}
        grid={{
          gutter: [50, 25],
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
          <div className={styles.listItem} key={item?.id}>
            <AgentCard
              mode={mode}
              refresh={() => {
                refresh();
              }}
              key={item?.name}
              item={item}
            />
          </div>
        )}
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
      />
      <Outlet />
    </div>
  );
};

export default AgentList;
