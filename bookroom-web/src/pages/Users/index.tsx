import { STATUS_MAP } from '@/constants/DataMap';
import DefaultLayout from '@/layouts/DefaultLayout';
import { queryActivedRoleList } from '@/services/admin/role';
import {
  deleteUser,
  updateUser,
  updateUserStatus,
  queryUserList,
} from '@/services/admin/user';
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
// import CreateForm from './components/CreateForm';

const UsersPage: React.FC<unknown> = () => {
  const actionRef = useRef<ActionType>();
  const editableActionRef = useRef<EditableFormInstance>();
  const [loading, setLoading] = useState<string | boolean | number>(false);

  // /**
  //  * 添加节点
  //  * @param fields
  //  */
  // const handleAdd = async (fields: API.UserInfoVO) => {
  //   setLoading('正在添加');
  //   try {
  //     await addUser({ ...fields });
  //     setLoading(false);
  //     message.success('添加成功');
  //     return true;
  //   } catch (error) {
  //     setLoading(false);
  //     return false;
  //   }
  // };

  /**
   * 更新节点
   */
  const handleUpdate = useCallback(
    async (userId: string, fields: API.UserInfoVO) => {
      if (!userId) return false;
      setLoading('正在修改');
      try {
        const result = await updateUser(
          {
            userId: userId || '',
          },
          {
            email: fields?.email || '',
            roleId: fields?.roleId || '',
            status: fields?.status || STATUS_MAP.DISABLE.value,
          },
        );
        setLoading(false);

        if (!result?.data) {
          throw `修改${fields?.username}失败`;
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
  const handleRemove = useCallback(async (userId: string) => {
    if (!userId) return false;
    setLoading('正在删除...');
    try {
      const result = await deleteUser({
        userId: userId,
      });
      if (!result?.data) {
        throw `删除${userId}失败`;
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
  const handleModifyUserStatus = useCallback(
    async (userId: string, status: number | string) => {
      if (!userId) return false;
      setLoading('正在修改');
      try {
        const result = await updateUserStatus(
          {
            userId: userId,
          },
          {
            status: status,
          },
        );
        setLoading(false);
        if (!result?.data) {
          throw `修改${userId}失败`;
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

  const columns: ProDescriptionsItemProps<API.UserInfo>[] = [
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
      title: '用户名',
      key: 'username',
      dataIndex: 'username',
      editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '用户名为必填项',
          },
        ],
      },
    },
    {
      title: '密码',
      key: 'password',
      dataIndex: 'password',
      valueType: 'password',
      hideInSearch: true,
      editable: false,
      hideInTable: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '密码为必填项',
          },
        ],
      },
    },
    {
      title: '角色',
      key: 'roleId',
      dataIndex: 'roleId',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '角色为必填项',
          },
        ],
      },
      valueType: 'select',
      request: async () => {
        const { data }: any = await queryActivedRoleList();
        if (data?.list?.length > 0) {
          return data?.list.map((item: { name: any; id: any }) => ({
            value: item?.id,
            label: item?.name,
          }));
        }
        return data?.list || [];
      },
    },
    {
      title: '邮箱',
      key: 'email',
      dataIndex: 'email',
      valueType: 'text',
      // editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '邮箱地址为必填项',
          },
          {
            type: 'email',
            message: '邮箱地址格式不正确',
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
      hideInSearch: true,
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
            title={`是否修改该用户?`}
            onConfirm={async (event) => {
              // actionRef?.current?.startEditable(record?.id);
              const result = await handleModifyUserStatus(
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
            title={`是否删除该用户?`}
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
        <EditableProTable<API.UserInfo>
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
          pagination={{
            defaultPageSize: 10,
            defaultCurrent: 1,
            showSizeChanger: true,
          }}
          // toolBarRender={() => [
          //   <Button
          //     key="1"
          //     type="primary"
          //     onClick={() => handleCreateModalVisible(true)}
          //   >
          //     新建
          //   </Button>,
          // ]}
          request={async (params, sorter, filter) => {
            const { data } = await queryUserList({
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
          //           const userIdListStr = selectedRowKeys.join(',');
          //           const result = await handleModifyUserStatus(
          //             userIdListStr,
          //             STATUS_MAP.ENABLE,
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
          //           const userIdListStr = selectedRowKeys.join(',');
          //           const result = await handleModifyUserStatus(
          //             userIdListStr,
          //             STATUS_MAP.DISABLE,
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
        {/* <CreateForm
          onCancel={() => handleCreateModalVisible(false)}
          modalVisible={createModalVisible}
        >
          <ProTable<API.UserInfo, API.UserInfo>
            onSubmit={async (value: API.UserInfo) => {
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
          />
        </CreateForm> */}
      </>
    </DefaultLayout>
  );
};

export default UsersPage;
