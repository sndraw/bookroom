import { ROLE_RULE } from '@/common/rule';
import DefaultLayout from '@/layouts/DefaultLayout';
import {
  addRole,
  deleteRole,
  updateRole,
  updateRoleStatus,
  queryRoleList,
} from '@/services/admin/role';
import { ROLE_STATUS_MAP } from '@/services/admin/role/enum';
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
  Space,
  Switch,
  Table,
  message,
} from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import useHeaderHeight from '@/hooks/useHeaderHeight';
import RoleAdd from '@/components/Role/RoleAdd';

const RolesPage: React.FC<unknown> = () => {
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
  const handleAdd = async (fields: API.RoleInfoVO) => {
    setLoading('正在添加');
    try {
      await addRole({ ...fields });
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
    async (roleId: string, fields: API.RoleInfoVO) => {
      if (!roleId) return false;
      setLoading('正在修改');
      try {
        const result = await updateRole(
          {
            roleId: roleId || '',
          },
          {
            name: fields?.name || '',
            code: fields?.code || '',
            status: fields?.status || ROLE_STATUS_MAP.DISABLE.value,
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
  const handleRemove = useCallback(async (roleId: string) => {
    if (!roleId) return false;
    setLoading('正在删除...');
    try {
      const result = await deleteRole({
        roleId: roleId,
      });
      if (!result?.data) {
        throw `删除${roleId}失败`;
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
   * 修改用户状态
   */
  const handleModifyRoleStatus = useCallback(
    async (roleId: string, status: number | string) => {
      if (!roleId) return false;
      setLoading('正在修改');
      try {
        const result = await updateRoleStatus(
          {
            roleId: roleId,
          },
          {
            status: status,
          },
        );
        setLoading(false);
        if (!result?.data) {
          throw `修改${roleId}失败`;
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

  const columns: ProDescriptionsItemProps<API.RoleInfo>[] = [
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
      title: '角色名称',
      key: 'name',
      dataIndex: 'name',
      //@ts-ignore
      width: 100,
      // editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '角色名称为必填项',
          },
          {
            pattern: ROLE_RULE.name.RegExp,
            message: ROLE_RULE.name.message,
          },
        ],
      },
    },
    {
      title: '角色标识',
      key: 'code',
      dataIndex: 'code',
      // editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '角色标识为必填项',
          },
          {
            pattern: ROLE_RULE.code.RegExp,
            message: ROLE_RULE.code.message,
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
      initialValue: String(ROLE_STATUS_MAP.ENABLE.value),
      hideInSearch: true,
      valueEnum: {
        [String(ROLE_STATUS_MAP.ENABLE.value)]: {
          text: ROLE_STATUS_MAP.ENABLE.text,
        },
        [String(ROLE_STATUS_MAP.DISABLE.value)]: {
          text: ROLE_STATUS_MAP.DISABLE.text,
        },
      },
      render: (dom, record, index, action) => {
        return (
          <Popconfirm
            key={record?.id}
            title={`是否修改该角色?`}
            onConfirm={async (event) => {
              // actionRef?.current?.startEditable(record?.id);
              const result = await handleModifyRoleStatus(
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
            title={`是否删除该角色?`}
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
        <EditableProTable<API.RoleInfo>
          headerTitle="查询表格"
          loading={{
            spinning: Boolean(loading),
            tip: loading,
          }}
          actionRef={actionRef}
          editableFormRef={editableActionRef}
          rowKey="id"
          search={
            {
              // labelWidth: 120,
            }
          }
          scroll={{
            y: containerHeight(),
          }}
          pagination={{
            defaultPageSize: 10,
            defaultCurrent: 1,
            showSizeChanger: true,
          }}
          toolBarRender={() => [
            <RoleAdd
              key="add"
              columns={columns}
              disabled={!!loading}
              onFinished={(values) => handleAdd(values)}
              refresh={() => actionRef?.current?.reload()}
            />,
          ]}
          request={async (params, sorter, filter) => {
            const { data } = await queryRoleList({
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
          // onChange={(value)=>{
          //   console.log(value)
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
      </>
    </DefaultLayout>
  );
};

export default RolesPage;
