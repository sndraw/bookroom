import { USER_RULE } from '@/common/rule';
import DefaultLayout from '@/layouts/DefaultLayout';
import { pwdChange } from '@/services/user/userInfo';
import { clearToken } from '@/utils/authToken';
import { ProCard } from '@ant-design/pro-components';
import { Button, Flex, Form, Input, message } from 'antd';
import { MD5 } from 'crypto-js';
import React, { useState } from 'react';
import styles from './index.less';

const PwdChangePage: React.FC<unknown> = () => {
  const [loading, setLoading] = useState(false);

  const [formRef] = Form.useForm();
  const onFinish = async (formData: API.PasswordInfo) => {
    // 原密码加密
    const encryptedOldPassword = MD5(formData.oldpassword).toString();
    // 密码加密
    const encryptedPassword = MD5(formData.password).toString();
    try {
      setLoading(true);
      const result = await pwdChange({
        ...formData,
        oldpassword: encryptedOldPassword,
        password: encryptedPassword,
      }).then((res) => {
        if (res?.data) {
          return res.data;
        }
      });
      if (!result) {
        return false;
      }
      message.success('密码修改成功，请重新登录');
      setTimeout(() => {
        setLoading(false);
        // 清理token
        clearToken();
        window.location.reload();
      }, 2000);
    } catch (error) {
      setLoading(false);
      message.error('密码修改失败，请重试');
    }
    return true;
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <DefaultLayout title={true}>
      <Flex justify="center">
        <ProCard className={styles.container}>
          <Form
            form={formRef}
            className={styles.formPanel}
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            disabled={loading}
          >
            <Form.Item<API.PasswordInfo>
              label="原密码"
              name="oldpassword"
              hasFeedback
              rules={[
                { required: true, message: '请输入原密码' },
                {
                  pattern: USER_RULE.password.RegExp,
                  message: USER_RULE.password.message,
                },
              ]}
            >
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item<API.PasswordInfo>
              label="新密码"
              name="password"
              hasFeedback
              rules={[
                { required: true, message: '请输入新密码' },
                {
                  pattern: USER_RULE.password.RegExp,
                  message: USER_RULE.password.message,
                },
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item<API.PasswordInfo>
              label="确认新密码"
              name="repassword"
              hasFeedback
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请输入确认密码" />
            </Form.Item>
            <Flex gap="middle" wrap="wrap" justify="flex-end">
              <Button
                className={styles.submitBtn}
                type="primary"
                htmlType="submit"
                size="large"
                block
              >
                提交
              </Button>
            </Flex>
          </Form>
        </ProCard>
      </Flex>
    </DefaultLayout>
  );
};

export default PwdChangePage;
