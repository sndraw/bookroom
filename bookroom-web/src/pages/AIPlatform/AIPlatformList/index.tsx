import {
  AI_AGENT_MAP,
  AI_GRAPH_PLATFORM_MAP,
  AI_LM_PLATFORM_MAP,
  AI_PLATFORM_TYPE_MAP,
} from '@/common/ai';
import { AI_PLATFORM_RULE, URL_RULE } from '@/common/rule';
import { STATUS_MAP } from '@/constants/DataMap';
import DefaultLayout from '@/layouts/DefaultLayout';
import {
  addAIPlatform,
  deleteAIPlatform,
  modifyAIPlatform,
  modifyAIPlatformStatus,
  queryAIPlatformList,
} from '@/services/common/ai/platform';
import { reverseStatus, statusToBoolean } from '@/utils/format';
import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProDescriptionsItemProps,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Divider,
  Flex,
  Popconfirm,
  Space,
  Switch,
  Table,
  message,
} from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import CreateForm from '../components/CreateForm';

const AIPlatformPage: React.FC<unknown> = () => {
  const actionRef = useRef<ActionType>();
  const editableActionRef = useRef<EditableFormInstance>();
  const [loading, setLoading] = useState<string | boolean | number>(false);
  // 创建节点
  const [createModalVisible, handleCreateModalVisible] =
    useState<boolean>(false);
  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.AIPlatformInfoVO) => {
    setLoading('正在添加');
    try {
      await addAIPlatform({ ...fields });
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
    async (platformId: string, fields: API.AIPlatformInfoVO) => {
      if (!platformId) return false;
      setLoading('正在修改');
      try {
        const result = await modifyAIPlatform(
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
      const result = await deleteAIPlatform({
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
  const handleModifyAIPlatformStatus = useCallback(
    async (platformId: string, status: number | string) => {
      if (!platformId) return false;
      // 待修改状态-文本
      setLoading('正在修改');
      try {
        const result = await modifyAIPlatformStatus(
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

  const columns: ProDescriptionsItemProps<API.AIPlatformInfo>[] = [
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
      title: '平台名称',
      key: 'name',
      dataIndex: 'name',
      // editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '平台名称为必填项',
          },
          {
            pattern: AI_PLATFORM_RULE.name.RegExp,
            message: AI_PLATFORM_RULE.name.message,
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
      // initialValue: AI_PLATFORM_TYPE_MAP.model.value,
      request: async () => {
        const options: any = Object.entries(AI_PLATFORM_TYPE_MAP).map(
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
            pattern: AI_PLATFORM_RULE.code.RegExp,
            message: AI_PLATFORM_RULE.code.message,
          },
        ],
      },
    },
    {
      title: '接口类型',
      key: 'code',
      dataIndex: 'code',
      // editable: false,
      // @ts-ignore
      // initialValue: AI_LM_PLATFORM_MAP.ollama.value,
      valueType: 'select',
      dependencies: ['type'],
      hideInSearch: true,
      request: async (params: any, props: any) => {
        if (!params?.type) {
          return [];
        }
        if (params?.type === AI_PLATFORM_TYPE_MAP.model.value) {
          const options: any = Object.entries(AI_LM_PLATFORM_MAP).map(
            (item) => {
              return {
                label: item[1]?.text,
                value: item[1]?.value,
              };
            },
          );
          return options;
        }
        if (params?.type === AI_PLATFORM_TYPE_MAP.graph.value) {
          const options: any = Object.entries(AI_GRAPH_PLATFORM_MAP).map(
            (item) => {
              return {
                label: item[1]?.text,
                value: item[1]?.value,
              };
            },
          );
          return options;
        }
        if (params?.type === AI_PLATFORM_TYPE_MAP.agent.value) {
          const options: any = Object.entries(AI_AGENT_MAP).map(
            (item) => {
              return {
                label: item[1]?.text,
                value: item[1]?.value,
              };
            },
          );
          return options;
        }
        return [];
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '接口类型为必填项',
          },
          {
            pattern: AI_PLATFORM_RULE.code.RegExp,
            message: AI_PLATFORM_RULE.code.message,
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
      render: (dom, entity) => {
        return (
          <Button href={entity?.host} type="link" target="_blank">
            {entity?.host}
          </Button>
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
      key: 'paramsConfig',
      dataIndex: 'paramsConfig',
      // editable: false,
      valueType: 'textarea',
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: false,
            message: '参数配置为必填项',
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
      fixed: 'right',
      width: 80,
      align: 'center',
      // 数值转换
      renderText: (value) => {
        return String(value);
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '状态为必填',
          },
        ],
      },
      valueType: 'select',
      // @ts-ignore
      initialValue: String(STATUS_MAP.ENABLE.value),
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
            title={`是否修改该平台?`}
            onConfirm={async (event) => {
              // actionRef?.current?.startEditable(record?.id);
              const result = await handleModifyAIPlatformStatus(
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
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      // 右侧固定列
      // @ts-ignore
      fixed: 'right',
      width: 100,
      render: (_: any, row, index, action) => (
        <>
          <a
            key={row?.id}
            onClick={() => {
              action?.startEditable(row?.id);
            }}
          >
            编辑
          </a>
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
      <>
        <EditableProTable<API.AIPlatformInfo>
          headerTitle="查询表格"
          loading={{
            spinning: Boolean(loading),
            tip: loading,
          }}
          actionRef={actionRef}
          editableFormRef={editableActionRef}
          rowKey="id"
          search={{
            labelWidth: 120,
          }}
          pagination={{
            defaultPageSize: 10,
            defaultCurrent: 1,
            showSizeChanger: true,
          }}
          toolBarRender={() => [
            <Button
              title="添加平台"
              key="addPlatform"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateModalVisible(true)}
            ></Button>,
          ]}
          request={async (params, sorter, filter) => {
            const { data } = await queryAIPlatformList({
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
          editable={{
            type: 'single',
            onSave: async (rowKey, data, originRow) => {
              const result = await handleUpdate(originRow.id, data);
              if (!result) {
                // actionRef?.current?.cancelEditable(rowKey);
                throw new Error('修改失败');
              }
            },
            actionRender: (_row, _config, defaultDom) => [
              defaultDom.save,
              defaultDom.cancel,
            ],
            // onDelete: async (rowKey, row) => {
            //   const result = await handleRemove(row.id);
            //   if (!result) {
            //     throw `删除${rowKey}错误`;
            //   }
            // },
          }}
          recordCreatorProps={false}
          rowSelection={{
            // 注释该行则默认不显示下拉选项
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            defaultSelectedRowKeys: [],
          }}
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
          // tableAlertOptionRender={({ selectedRowKeys }) => {
          //   return (
          //     <Space size={16}>
          //       <Button
          //         type="primary"
          //         onClick={async () => {
          //           const platformIdListStr = selectedRowKeys.join(',');
          //           const result = await handleModifyAIPlatformStatus(
          //             platformIdListStr,
          //             STATUS_MAP.ENABLE.value,
          //           );
          //           if (result) {
          //             actionRef.current?.clearSelected?.();
          //             actionRef.current?.reloadAndRest?.();
          //           }
          //         }}
          //       >
          //         批量启用
          //       </Button>
          //       <Button
          //         danger
          //         onClick={async () => {
          //           const platformIdListStr = selectedRowKeys.join(',');
          //           const result = await handleModifyAIPlatformStatus(
          //             platformIdListStr,
          //             STATUS_MAP.DISABLE.value,
          //           );
          //           if (result) {
          //             actionRef.current?.clearSelected?.();
          //             actionRef.current?.reloadAndRest?.();
          //           }
          //         }}
          //       >
          //         批量禁用
          //       </Button>
          //     </Space>
          //   );
          // }}
        />
        <CreateForm
          onCancel={() => handleCreateModalVisible(false)}
          modalVisible={createModalVisible}
        >
          <ProTable<API.AIPlatformInfo, API.AIPlatformInfo>
            onSubmit={async (value: API.AIPlatformInfo) => {
              const success = await handleAdd(value);
              if (success) {
                handleCreateModalVisible(false);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }}
            rowKey="id"
            type="form"
            // @ts-ignore
            columns={columns}
            form={{
              layout: 'horizontal', // 设置表单布局为水平布局
              labelCol: { span: 6 }, // 标签占据的列数
              wrapperCol: { span: 18 }, // 输入框占据的列数
              // 默认值
              initialValues: {
                type: AI_PLATFORM_TYPE_MAP.model.value,
                code: AI_LM_PLATFORM_MAP.ollama.value,
                status: String(STATUS_MAP.ENABLE.value),
              },
              submitter: {
                render: (_, dom) => (
                  <Flex gap={16} justify={'flex-end'}>
                    {dom}
                  </Flex>
                ),
              },
            }}
          />
        </CreateForm>
      </>
    </DefaultLayout>
  );
};

export default AIPlatformPage;
