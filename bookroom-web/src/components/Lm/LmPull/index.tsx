import { DownloadOutlined } from '@ant-design/icons';
import { DrawerForm, ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, message, Spin } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface LmPullProps {
  platform: string;
  pullItem?: (params: any, fields: any) => Promise<any>;
  refresh: () => void;
}

const LmPull: React.FC<PropsWithChildren<LmPullProps>> = (props) => {
  const [loading, setLoading] = useState<string | boolean | number>(false);
  const { platform, refresh, pullItem } = props;
  const [form] = Form.useForm<API.AILmInfoVO>();
  /**
   * 下载模型
   * @param fields
   */
  const handlePull = async (fields: API.AILmInfoVO) => {
    if (!platform) return false;
    let loadingMsg = `模型“${fields?.model}”下载中`;
    setLoading(loadingMsg);
    try {
      const is_stream = true;
      await pullItem?.(
        { platform: platform, is_stream },
        {
          ...fields,
          model: encodeURIComponent(fields?.model.trim()),
        },
      ).then(async (res) => {
        const { response, reader, decoder } = res as any;
        if (!response?.ok) {
          let resObj: any = res;
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            resObj = await res?.json?.();
          }
          throw new Error(resObj?.message || res?.statusText || '下载失败');
        }
        if (!is_stream) {
          message.success(`模型“${fields?.model}”下载成功`);
          return response;
        }
        let responseData = '';
        // 模拟进度更新的函数
        const updateProgress = async (chunk: any) => {
          if (!chunk?.done && chunk?.value) {
            const chunkStr = decoder.decode(chunk.value, { stream: true });
            if (chunkStr) {
              try {
                const chunkJson = JSON.parse(chunkStr);
                if (chunkJson?.status === 'success') {
                  message.success(`模型“${fields?.model}”下载成功`);
                  return;
                }
                if (chunkJson?.status === 'error') {
                  message.error(
                    `模型“${fields?.model}”下载失败:${chunkJson?.error}`,
                  );
                  return;
                }
                let content = '';
                content += ` | ${chunkJson?.status || chunkJson?.error || ''}`;
                if (chunkJson?.total && chunkJson?.completed) {
                  content += ` | 已下载${(chunkJson?.completed / 1024 / 1024).toFixed(2)}MB，共${(chunkJson?.total / 1024 / 1024).toFixed(2)}MB`;
                }
                responseData = content;
              } catch (e) {
                responseData = chunkStr;
              }
              setLoading(`${loadingMsg}${responseData}`);
            }
          }
          if (chunk?.done) {
            // setLoading(false);
            return;
          }
          // 递归调用读取下一个分块
          await reader.read().then(updateProgress);
        };
        // 开始读取流数据
        await reader.read().then(updateProgress);
        return response;
      });
      return true;
    } catch (error: any) {
      let errorData = null;
      if (error?.name === 'AbortError') {
        errorData = { message: '请求被终止' };
      } else {
        try {
          errorData = (await error?.json?.());
        } catch (e) {
          errorData = error?.info || error;
        }
      }
      message.error(`模型“${fields?.model}”下载失败：${errorData?.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerForm
      title="下载模型"
      disabled={!!loading}
      width={"378px"}
      trigger={
        <Button
          title={loading ? String(loading) : '下载模型'}
          icon={<DownloadOutlined />}
          type="primary"
          shape={'circle'}
          loading={!!loading}
          disabled={!!loading}
        />
      }
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
        const result = await handlePull(values as any);
        if (!result) {
          return false;
        }
        refresh?.(); // 刷新页面
        return true;
      }}
    >
      <ProFormText
        name="model"
        label="模型"
        rules={[
          {
            required: true,
            message: '请输入模型',
          },
          {
            min: 2,
            max: 255,
            message: '模型名称长度为2-255个字符',
          },
        ]}
        placeholder="请输入模型"
      />
      <Spin tip={'正在下载...'} spinning={!!loading}>
        {loading}
      </Spin>
    </DrawerForm>
  );
};

export default LmPull;
