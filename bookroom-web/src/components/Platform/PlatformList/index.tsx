import { PLATFORM_RULE, URL_RULE } from '@/common/rule';
import {
  addPlatform,
  queryPlatformList,
  getPlatformCodeList,
  getPlatformTypeList,
} from '@/services/common/platform';
import {
  ActionType,
  EditableFormInstance,
  ProDescriptionsItemProps,
  ProList,
} from '@ant-design/pro-components';
import {
  Divider,
  FloatButton,
  Input,
  Select,
  Space,
  message,
} from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import useHeaderHeight from '@/hooks/useHeaderHeight';
import { PLATFORM_TYPE_MAP } from '@/common/platform';
import PlatformAdd from '@/components/Platform/PlatformAdd';
import styles from './index.less';
import classNames from 'classnames';
import PlatformCard from '@/components/Platform/PlatformCard';
import { PLATFORM_STATUS_MAP } from '@/services/common/platform/enum';
import { ReloadOutlined } from '@ant-design/icons';
type PlatformListPropsType = {
  dataList: API.PlatformInfo[];
  refresh: () => void;
  loading: boolean;
  className?: string;
  children?: React.ReactNode;
};
const PlatformList: React.FC<PlatformListPropsType> = (props) => {
  const {
    dataList,
    refresh,
    loading,
    className,
  } = props;

  const actionRef = useRef<ActionType>();
  const editableActionRef = useRef<EditableFormInstance>();
  const [reqLoading, setReqLoading] = useState<string | boolean | number>(false);
  const [searchText, setSearchText] = useState<string>('' as string);
  const [platformStatus, setPlatformStatus] = useState<number | null>(null);

  const headerHeight = useHeaderHeight();
  // 计算样式
  const containerStyle = useCallback(() => {
    return {
      height: `calc(100vh - ${headerHeight + 72}px)`,
    };
  }, [headerHeight]);



  /**
   * 添加平台
   * @param fields
   */
  const handleAdd = async (fields: API.PlatformInfoVO) => {
    setReqLoading(true);
    try {
      // 如果parameters是字符串
      if (fields?.parameters && typeof fields?.parameters === 'string') {
        fields.parameters = JSON.parse(fields.parameters);
      }
      // 添加平台
      await addPlatform({ ...fields });
      message.success('添加成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      setReqLoading(false);
    }
  };

  const columns: ProDescriptionsItemProps<API.PlatformInfo>[] = [
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
      title: "序号",
      key: 'index',
      dataIndex: 'index',
      hideInForm: true,
      editable: false,
      hideInSearch: true,
      //@ts-ignore
      width: 50,
      render: (text, record, index, action) => {
        if (action?.pageInfo?.current) {
          const baseIndex = (action?.pageInfo?.current - 1) * action?.pageInfo?.pageSize;
          return baseIndex + index + 1
        }
        return index + 1
      }
    },
    {
      title: '接口名称',
      key: 'name',
      dataIndex: 'name',
      //@ts-ignore
      width: 100,
      // editable: false,
      sorter: true, // 启用排序功能
      formItemProps: {
        rules: [
          {
            required: true,
            message: '接口名称为必填项',
          },
          {
            pattern: PLATFORM_RULE.name.RegExp,
            message: PLATFORM_RULE.name.message,
          },
        ],
      },
    },
    {
      title: '配置类型',
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
      request: async () => {
        const options: any = getPlatformTypeList() || [];
        return options;
      },
      fieldProps: (form) => ({
        onChange: (value: any) => {
          form?.setFieldValue?.('code', '');
        },
      }),
      formItemProps: {
        rules: [
          {
            required: true,
            message: '配置类型为必填项',
          },
          {
            pattern: PLATFORM_RULE.code.RegExp,
            message: PLATFORM_RULE.code.message,
          },
        ],
      },
    },
    {
      title: '接口类型',
      key: 'code',
      dataIndex: 'code',
      // editable: false,
      //@ts-ignore
      width: 100,
      sorter: true, // 启用排序功能
      valueType: 'select',
      dependencies: ['type'],
      hideInSearch: true,
      // initialValue: AI_LM_PLATFORM_MAP.ollama.value,
      renderText: (text, record) => {
        const newText = getPlatformCodeList({ code: record?.code })?.[0]?.label || text
        return newText
      },
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        // 如果type不存在，置空
        if (!form.getFieldValue('type')) {
          form.setFieldsValue({ code: '' });
        } else {
          // 如果code不在配置类型列表中，置空
          const newOptions = getPlatformCodeList({ type: form.getFieldValue('type'), code: form?.getFieldValue('code') })
          if (!newOptions?.length) {
            form.setFieldsValue({ code: '' });
          }
        }
        return (
          <Select
            {...rest}
            onChange={(value) => {
              form.setFieldsValue({ code: value });
            }}
            options={form.getFieldValue('type') ? getPlatformCodeList({ type: form.getFieldValue('type') }) : []}
          />
        );
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '接口类型为必填项',
          },
          {
            pattern: PLATFORM_RULE.code.RegExp,
            message: PLATFORM_RULE.code.message,
          },
        ],
      },
    },
    {
      title: '接口地址',
      key: 'host',
      dataIndex: 'host',
      // editable: false,
      hideInSearch: true,
      //@ts-ignore
      width: 200,
      ellipsis: {
        showTitle: true,
      },
      render: (dom, entity) => {
        return (
          <a style={{ whiteSpace: "normal" }} href={entity?.host} target="_blank">
            {entity?.host}
          </a>
        );
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '连接地址为必填项',
          },
          {
            pattern: URL_RULE.ipAndUrl.RegExp,
            message: URL_RULE.ipAndUrl.message,
          },
        ],
      },
    },
    // API Key
    {
      title: 'API Key',
      key: 'apiKey',
      dataIndex: 'apiKey',
      // @ts-ignore
      width: 100,
      // editable: false,
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: false,
            message: 'API Key为必填项',
          },
        ],
      },
    },
    {
      title: '参数配置',
      key: 'parameters',
      dataIndex: 'parameters',
      editable: false,
      valueType: 'textarea',
      hideInSearch: true,
      hideInForm: false,
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
        initialValue: String(PLATFORM_STATUS_MAP.ENABLE.value),
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
        [String(PLATFORM_STATUS_MAP.ENABLE.value)]: {
          text: PLATFORM_STATUS_MAP.ENABLE.text,
        },
        [String(PLATFORM_STATUS_MAP.DISABLE.value)]: {
          text: PLATFORM_STATUS_MAP.DISABLE.text,
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

  const filterData = useMemo(() => {
    const newDataList = [
      ...(dataList || [])
    ]

    if (!searchText && !platformStatus) return newDataList;
    return newDataList?.filter((item: any) => {
      let flag = true;
      if (searchText) {
        flag = flag && item.name?.includes(searchText)
      }
      if (platformStatus) {
        flag = flag && item.status === platformStatus
      }
      return flag
    });
  }, [dataList, searchText, platformStatus]);


  const isLoading = loading || reqLoading;

  return (
    <div className={classNames(styles.container, className)} style={containerStyle()}>
      <Space size={16} wrap className={styles.header}>
        <Space size={0} wrap className={styles.headerTitle}>
          <span>系统配置</span>
        </Space>
        <Divider type="vertical" />
        {/* 筛选接口名称  */}
        <Input.Search
          allowClear
          placeholder={'搜索接口名称'}
          defaultValue={searchText}
          onSearch={(value) => {
            setSearchText(value);
          }}
        />
        {/* 运行状态 */}
        <Select
          className={styles.selectElement}
          value={platformStatus}
          allowClear
          placeholder={'启用状态'}
          onChange={(value) => {
            setPlatformStatus(value);
          }}
          options={[
            {
              label: PLATFORM_STATUS_MAP.ENABLE.text,
              value: PLATFORM_STATUS_MAP.ENABLE.value,
            },
            {
              label: PLATFORM_STATUS_MAP.DISABLE.text,
              value: PLATFORM_STATUS_MAP.DISABLE.value,
            }
          ]}
        />
        <FloatButton.Group key={'agentGroup'}>
          <PlatformAdd
            key="add"
            columns={columns}
            disabled={!!isLoading}
            onFinished={(values) => handleAdd(values)}
            refresh={refresh}
          />
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

      <ProList<API.PlatformInfo>
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
        isLoading={{
          spinning: Boolean(isLoading),
          tip: isLoading,
        }}
        actionRef={actionRef}
        editableFormRef={editableActionRef}
        dataSource={filterData || []}
        rowKey="id"
        renderItem={(item: any) => (
          <div className={styles.listItem} key={item?.id}>
            <PlatformCard
              columns={columns}
              refresh={() => {
                refresh();
              }}
              key={item?.name}
              item={item}
            />
          </div>
        )}
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
          total: filterData?.length || 0
        }}
        // @ts-ignore
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        // }}
        recordCreatorProps={false}
      // rowSelection={{
      //   // 注释该行则默认不显示下拉选项
      //   selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
      //   defaultSelectedRowKeys: [],
      // }}
      // tableAlertRender={({ selectedRowKeys, onCleanSelected }) => {
      //   return (
      //     <Space size={24}>
      //       <span>
      //         已选 {selectedRowKeys.length} 项
      //         <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
      //           取消选择
      //         </a>
      //       </span>
      //     </Space>
      //   );
      // }}
      />
    </div>
  );
};

export default PlatformList;
