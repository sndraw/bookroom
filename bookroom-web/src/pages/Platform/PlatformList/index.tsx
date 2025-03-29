import { PLATFORM_RULE, URL_RULE } from '@/common/rule';
import { STATUS_MAP } from '@/constants/DataMap';
import DefaultLayout from '@/layouts/DefaultLayout';
import {
  addPlatform,
  deletePlatform,
  updatePlatform,
  updatePlatformStatus,
  queryPlatformList,
  updatePlatformParameters,
  getPlatformTypeList,
} from '@/services/common/platform';
import { reverseStatus, statusToBoolean } from '@/utils/format';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Popconfirm,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import useHeaderHeight from '@/hooks/useHeaderHeight';
import { PLATFORM_TYPE_MAP } from '@/common/platform';
import ParametersEdit from '@/components/Platform/PlatformParameters';
import PlatformAdd from '@/components/Platform/PlatformAdd';
import PlatformEdit from '@/components/Platform/PlatformEdit';

const PlatformPage: React.FC<unknown> = () => {
  const actionRef = useRef<ActionType>();
  const editableActionRef = useRef<EditableFormInstance>();
  const [loading, setLoading] = useState<string | boolean | number>(false);
  const headerHeight = useHeaderHeight();

  // 计算样式
  const containerHeight = useCallback(() => {
    return `calc(100vh - ${headerHeight + 320}px)`;
  }, [headerHeight]);

  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.PlatformInfoVO) => {
    setLoading('正在添加');
    try {
      // 如果parameters是字符串
      if (fields?.parameters && typeof fields?.parameters === 'string') {
        fields.parameters = JSON.parse(fields.parameters);
      }
      // 添加平台
      await addPlatform({ ...fields });
      setLoading(false);
      message.success('添加成功');
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  /**
   * 更新节点
   */
  const handleUpdate = useCallback(
    async (platformId: string, fields: API.PlatformInfoVO) => {
      if (!platformId) return false;
      setLoading('正在修改');
      try {
        // 如果parameters是字符串
        if (fields?.parameters && typeof fields?.parameters === 'string') {
          fields.parameters = JSON.parse(fields.parameters);
        }
        // 如果status存在
        if (fields?.status) {
          fields.status = Number(fields.status);
        }
        const result = await updatePlatform(
          {
            platform: platformId || '',
          },
          {
            ...fields,
          },
        );
        setLoading(false);

        if (!result?.data) {
          throw `修改${fields?.name}失败`;
        }
        message.success('修改成功');
        return true;
      } catch (error: any) {
        setLoading(false);
        // message.error(error?.message || '修改失败');
        return false;
      }
    },
    [],
  );
  /**
   *  删除节点
   */
  const handleRemove = useCallback(async (platformId: string) => {
    if (!platformId) return false;
    setLoading('正在删除...');
    try {
      const result = await deletePlatform({
        platform: platformId,
      });
      if (!result?.data) {
        throw `删除${platformId}失败`;
      }
      setLoading(false);
      message.success('删除成功，即将刷新');
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * 修改平台状态
   */
  const handleModifyPlatformStatus = useCallback(
    async (platformId: string, status: number | string) => {
      if (!platformId) return false;
      // 待修改状态-文本
      setLoading('正在修改');
      try {
        const result = await updatePlatformStatus(
          {
            platform: platformId,
          },
          {
            status: status,
          },
        );
        setLoading(false);
        if (!result?.data) {
          throw `修改${platformId}失败`;
        }
        message.success(`修改成功`);
        return true;
      } catch (error: any) {
        setLoading(false);
        // message.error(error?.message || '修改失败');
        return false;
      }
    },
    [],
  );

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
      title: '平台名称',
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
            message: '平台名称为必填项',
          },
          {
            pattern: PLATFORM_RULE.name.RegExp,
            message: PLATFORM_RULE.name.message,
          },
        ],
      },
    },
    {
      title: '平台类型',
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
        const options: any = Object.entries(PLATFORM_TYPE_MAP).map(
          (item) => {
            return {
              label: item[1]?.text,
              value: item[1]?.value,
            };
          },
        );
        return options;
      },
      fieldProps: (form, fieldProps) => ({
        onChange: (value: any) => {
          if (fieldProps?.isEditable) {
            editableActionRef?.current?.setRowData?.(fieldProps?.rowIndex, {
              code: '',
            });
            return;
          }
          form?.setFieldValue?.('code', '');
        },
      }),
      formItemProps: {
        rules: [
          {
            required: true,
            message: '平台类型为必填项',
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
        const newText = getPlatformTypeList({ code: record?.code })?.[0]?.label || text
        return newText
      },
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        // 如果不存在，置空
        const newOptions = getPlatformTypeList({ type: form.getFieldValue('type'), code: form?.getFieldValue('code') })
        if (!newOptions?.length) {
          form.setFieldsValue({ code: '' });
        }
        console.log()
        return (
          <Select
            {...rest}
            onChange={(value) => {
              form.setFieldsValue({ code: value });
            }}
            options={getPlatformTypeList({ type: form.getFieldValue('type') })}
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
      title: '连接地址',
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
      },
      render: (dom, record, index, action) => {
        return (
          <Popconfirm
            key={record?.id}
            title={`是否修改该平台状态?`}
            onConfirm={async (event) => {
              // actionRef?.current?.startEditable(record?.id);
              const result = await handleModifyPlatformStatus(
                record?.id,
                reverseStatus(record.status),
              );
              if (result) {
                action?.reload();
              }
            }}
            okText="是"
            cancelText="否"
          >
            <Switch value={statusToBoolean(record.status)} />
          </Popconfirm>
        );
      },
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
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      // 右侧固定列
      // @ts-ignore
      fixed: 'right',
      width: 120,
      render: (_: any, row, index, action) => (
        <>
          <PlatformEdit
            data={row}
            columns={columns}
            onFinished={(values) => handleUpdate(row.id, values)}

            refresh={() => action?.reload()}
          />
          <Divider type="vertical" />
          <Popconfirm
            key="option-delete"
            title={`是否删除该平台?`}
            onConfirm={async () => {
              const result = await handleRemove(row?.id);
              if (result) {
                action?.reload();
              }
            }}
            okText="是"
            cancelText="否"
          >
            <Button
              type="link"
              danger
              style={{ padding: 0 }}
              key={'option-delete-btn'}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <EditableProTable<API.PlatformInfo>
        headerTitle="查询表格"
        loading={{
          spinning: Boolean(loading),
          tip: loading,
        }}
        actionRef={actionRef}
        editableFormRef={editableActionRef}
        rowKey="id"
        scroll={{
          y: containerHeight(),
        }}
        search={{
          labelWidth: 120,
        }}
        pagination={{
          defaultPageSize: 10,
          defaultCurrent: 1,
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <PlatformAdd
            key="add"
            columns={columns}
            disabled={!!loading}
            onFinished={(values) => handleAdd(values)}
            refresh={() => actionRef?.current?.reload()}
          />,
        ]}
        request={async (params, sorter, filter) => {
          const { data } = await queryPlatformList({
            ...params,
            // @ts-ignore
            sorter,
            filter,
          });
          return {
            data: [...(data?.list || [])],
            // 不传会使用 data 的长度，如果是分页一定要传
            total: data?.total || 0,
          };
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
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => {
          return (
            <Space size={24}>
              <span>
                已选 {selectedRowKeys.length} 项
                <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                  取消选择
                </a>
              </span>
            </Space>
          );
        }}
      />
    </DefaultLayout>
  );
};

export default PlatformPage;
