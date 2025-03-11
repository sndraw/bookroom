import { GRAPH_WORKSPACE_RULE } from '@/common/rule';
import {
  addGraphWorkspace,
  updateGraphWorkspace,
} from '@/services/common/ai/graph';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

export enum GraphWorkSpaceActionEnum {
  CREATE = 'create',
  EDIT = 'update',
}
interface GraphWorkspaceSaveProps {
  graph: string;
  workspace?: string;
  action: GraphWorkSpaceActionEnum;
  refresh: () => void;
}

const GraphWorkspaceSave: React.FC<
  PropsWithChildren<GraphWorkspaceSaveProps>
> = (props) => {
  const [loading, setLoading] = useState<string | boolean | number>(false);
  const { graph, workspace, refresh, action } = props;
  const [form] = Form.useForm<API.AILmInfoVO>();
  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.AILmInfoVO) => {
    if (!graph) return false;
    setLoading(true);
    try {
      await addGraphWorkspace(
        { graph: graph },
        {
          ...fields,
          name: fields?.name?.trim(),
        },
      ).then(async (res) => {
        message.success('图谱空间添加成功');
        refresh(); // 刷新列表
      });
      return true;
    } catch (error: any) {
      const errorData = error;
      console.error(`图谱空间添加失败：${errorData?.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 修改节点
   * @param fields
   */
  const handleUpdate = async (fields: API.AILmInfoVO) => {
    if (!graph) return false;
    if (!workspace) return false;
    setLoading(true);
    try {
      await updateGraphWorkspace(
        {
          graph,
          workspace: encodeURIComponent(workspace.trim() || ''),
        },
        {
          ...fields,
          name: fields?.name?.trim(),
        },
      ).then(async (res) => {
        message.success('图谱空间修改成功');
        refresh(); // 刷新列表
      });
      return true;
    } catch (error: any) {
      const errorData = error;
      console.error(`图谱空间修改失败：${errorData?.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // // 图谱空间类型选择器
  // const modelTypeOptions: any = () => {
  //   return Object.values(AI_LM_TYPE_MAP).map((item) => ({
  //     label: item?.text,
  //     value: item?.value,
  //   }));
  // };

  const actionText =
    action === GraphWorkSpaceActionEnum.EDIT ? '编辑图谱空间' : '添加图谱空间';

  return (
    <ModalForm
      title={actionText}
      trigger={
        <Button
          title={actionText}
          icon={
            action === GraphWorkSpaceActionEnum.EDIT ? (
              <EditOutlined />
            ) : (
              <PlusOutlined />
            )
          }
          type={action === GraphWorkSpaceActionEnum.EDIT ? 'text' : 'primary'}
          shape={
            action === GraphWorkSpaceActionEnum.EDIT ? 'default' : 'circle'
          }
          loading={!!loading}
          disabled={!!loading}
        ></Button>
      }
      modalProps={{ destroyOnClose: true }}
      form={form}
      onOpenChange={(open) => {
        if (!open) {
          form.resetFields();
        }
      }}
      onFinish={async (values) => {
        const validate = await form.validateFields();
        if (!validate) {
          return false;
        }
        let result = null;
        if (action === GraphWorkSpaceActionEnum.EDIT) {
          result = await handleUpdate(values);
        } else {
          result = await handleAdd(values);
        }
        if (!result) {
          return false;
        }
        return true;
      }}
    >
      <ProFormText
        name="name"
        label="图谱空间"
        rules={[
          {
            required: true,
            message: '请输入图谱空间',
          },
          {
            pattern: GRAPH_WORKSPACE_RULE.name.RegExp,
            message: GRAPH_WORKSPACE_RULE.name.message,
          },
        ]}
        initialValue={workspace}
        placeholder="图谱空间"
      />
    </ModalForm>
  );
};

export default GraphWorkspaceSave;
