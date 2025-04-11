import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import PlatformSelect from '@/components/Platform/PlatformSelect';
// import PlatformSetting from '@/components/Platform/PlatformSetting';
import { MODE_ENUM, STATUS_MAP } from '@/constants/DataMap';
import { deleteAILm, getAILmTypeList, pullAILm, runAILm } from '@/services/common/ai/lm';
import { getPlatformInfo } from '@/services/common/platform';
import { ReloadOutlined } from '@ant-design/icons';
import { ProDescriptionsItemProps, ProList } from '@ant-design/pro-components';
import { Access, Outlet, useAccess, useRequest } from '@umijs/max';
import { FloatButton, Input, Select, Space } from 'antd';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LmPull from '../LmPull';
import LmCard from '../LmCard';
import styles from './index.less';
import useHeaderHeight from '@/hooks/useHeaderHeight';
import LmAdd from '../LmAdd';

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
    // 排序，按时间倒序
    newDataList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const columns: ProDescriptionsItemProps<API.AILmInfo>[] = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      hideInSearch: true,
      hideInTable: true,
      hideInForm: true,
      editable: false,
    },
    {
      title: '模型名称',
      key: 'name',
      dataIndex: 'name',
      //@ts-ignore
      width: 100,
      maxLength: 255, // 设置最大长度为255
      // editable: false,
      sorter: true, // 启用排序功能
      formItemProps: {
        rules: [
          {
            required: true,
            message: '模型名称为必填项',
          },
          {
            min: 2,
            max: 255,
            message: '模型名称长度为2-255个字符',
          },
        ],
      },
    },
    {
      title: '模型分类',
      key: 'type',
      dataIndex: 'type',
      // editable: false,
      valueType: 'select',
      // 默认值
      // @ts-ignore
      // initialValue: PLATFORM_TYPE_MAP.model.value,
      //@ts-ignore
      width: 100,
      sorter: true, // 启用排序功能
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        return (
          <Select
            {...rest}
            mode={"multiple"}
            allowClear
            options={getAILmTypeList() || []}
          />
        );
      },
      formItemProps: {
        // layout:"horizontal",
        rules: [
          {
            required: true,
            message: '模型分类为必填项',
          }
        ],
      },
    },
    {
      title: '参数配置',
      key: 'parameters',
      dataIndex: 'parameters',
      editable: false,
      valueType: 'jsonCode',
      hideInSearch: true,
      hideInForm: true,
      // @ts-ignore
      width: 150,
      // 数值转换
      renderText: (value) => {
        let text = String(value);
        // 如果是object
        if (typeof value === 'object') {
          // 如果object为空
          if (Object.keys(value).length === 0) {
            text = ""
          } else {
            text = JSON.stringify(value, null, 2)
          }
        }
        return <pre>{text}</pre>;
      },
      formItemProps: {
        initialValue: JSON.stringify({}),
        rules: [
          {
            required: false,
            message: '参数配置为必填项',
          },
          {
            //  自定义规则
            validator(_: any, value: any) {
              try {
                JSON.parse(value);
                return Promise.resolve();
              } catch (error) {
                return Promise.reject(new Error('参数配置必须是有效的JSON格式'));
              }
            },
          },
        ],
      },
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      editable: false,
      hideInForm: true,
      hideInTable: true,
      // @ts-ignore
      width: 80,
      sorter: true,
      fixed: 'right',
      align: 'center',
      // 数值转换
      renderText: (value) => {
        return String(value);
      },
      formItemProps: {
        // layout:"horizontal",
        initialValue: String(STATUS_MAP.ENABLE.value),
        rules: [
          {
            required: true,
            message: '状态为必填',
          },
        ],
      },
      valueType: 'select',
      hideInSearch: true,
      valueEnum: {
        [String(STATUS_MAP.ENABLE.value)]: {
          text: STATUS_MAP.ENABLE.text,
        },
        [String(STATUS_MAP.DISABLE.value)]: {
          text: STATUS_MAP.DISABLE.text,
        },
      }
    },
    // 创建时间
    {
      title: '创建时间',
      key: 'createdAt',
      dataIndex: 'createdAt',
      editable: false,
      // @ts-ignore
      width: 150,
      hideInSearch: true,
      hideInForm: true,
      render: (dom, entity) => {
        return (
          <span>{new Date(entity?.createdAt || "").toLocaleString()}</span>
        )
      }
    },
    // 修改时间
    {
      title: '修改时间',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      editable: false,
      // @ts-ignore
      width: 150,
      hideInSearch: true,
      hideInForm: true,
      render: (dom, entity) => {
        return (
          <span>{new Date(entity?.updatedAt || "").toLocaleString()}</span>
        )
      }
    }
  ];


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
        <Access
          accessible={platformInfo?.code === AI_LM_PLATFORM_MAP?.ollama.value}>
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
        </Access>
        {/* 运行状态 */}
        <FloatButton.Group key={'addLmGroup'}>
          <Access
            accessible={
              canEdit &&
              platformInfo?.code === AI_LM_PLATFORM_MAP?.openai.value
            }
            key="addLmAccess"
          >
            {platform && (
              <LmAdd
                platform={platform}
                columns={columns}
                disabled={isLoading}
                refresh={refresh}
              />
            )}
          </Access>
          <Access
            accessible={
              canEdit &&
              platformInfo?.code === AI_LM_PLATFORM_MAP?.ollama.value
            }
            key="pullLmAccess"
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
          pageSize: 12,
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
              columns={columns}
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
