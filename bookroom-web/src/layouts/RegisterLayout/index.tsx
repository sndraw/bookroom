import { Link, useModel, useNavigate } from '@umijs/max';
import { Button, Checkbox, Flex, Form, Input, Modal, message } from 'antd';
import React from 'react';

import LoginLayout from '@/layouts/LoginLayout';
import styles from './index.less';

import { USER_RULE } from '@/common/rule';
import AgreementPage from '@/pages/Agreement';
import ROUTE_MAP from '@/routers/routeMap';
import { MD5 } from 'crypto-js';

export type PropsType = {
  title: string;
  requestApi: (params: API.RegisterInfo) => Promise<any>;
  isSetup?: boolean;
};
const RegisterLayout: React.FC<PropsType> = (props) => {
  const { title = '注册', requestApi, isSetup } = props;
  const { showLoading, hideLoading } = useModel('globalLoading');
  const [modal, contextHolder] = Modal.useModal();

  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const onFinish = async (formData: API.RegisterInfo) => {
    // 密码加密
    const encryptedPassword = MD5(formData.password).toString();
    showLoading();
    // 注册
    const registerInfo = await requestApi({
      ...formData,
      password: encryptedPassword,
    }).then((res) => {
      if (res?.data) {
        return res.data;
      }
    });
    if (!registerInfo) {
      return false;
    }
    message.success(`${title}成功`);
    setTimeout(() => {
      hideLoading();
      if (isSetup) {
        window.location.reload();
        return;
      }
      navigate(ROUTE_MAP.LOGIN, { replace: true });
    }, 2000);
    return true;
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  type FieldType = {
    username: string;
    email: string;
    password: string;
    repassword: string;
    agreement?: string;
  };

  const titleStr = isSetup ? '设置管理员账号' : title;

  return (
    <LoginLayout title={titleStr}>
      <Form
        form={formRef}
        className={styles.formPanel}
        name="basic"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        labelAlign="left"
      >
        <Form.Item<FieldType>
          label="用户"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            {
              pattern: USER_RULE.username.RegExp,
              message: USER_RULE.username.message,
            },
            { whitespace: true, message: '不能为空字符' },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item<FieldType>
          label="邮箱"
          name="email"
          rules={[
            { required: true, type: 'email', message: '请输入正确的邮箱地址' },
            { whitespace: true, message: '不能为空字符' },
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>

        <Form.Item<FieldType>
          label="密码"
          name="password"
          hasFeedback
          rules={[
            { required: true, message: '请输入密码' },
            {
              pattern: USER_RULE.password.RegExp,
              message: USER_RULE.password.message,
            },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item<FieldType>
          label="确认密码"
          name="repassword"
          hasFeedback
          rules={[
            { required: true, message: '请输入确认密码' },
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
        {!isSetup && (
          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Form.Item<FieldType>
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error('同意用户协议后完成注册')),
                },
              ]}
              noStyle
            >
              <Checkbox>
                我已经阅读
                {/* <Link to={ROUTE_MAP.AGREEMENT} target="_blank">
                用户协议
              </Link> */}
                {contextHolder}
                <a
                  onClick={(event) => {
                    event?.stopPropagation?.();
                    event?.preventDefault?.();
                    modal.info({
                      width: 800,
                      title: '用户协议',
                      content: (
                        <div className={styles.agreementContent}>
                          <AgreementPage />
                        </div>
                      ),
                      okText: '确定',
                      onOk() {
                        formRef.setFieldValue('agreement', true);
                      },
                      closable: true,
                    });
                  }}
                >
                  用户协议
                </a>
              </Checkbox>
            </Form.Item>
          </Form.Item>
        )}
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
        {!isSetup && (
          <div className={styles.tool}>
            <Link className={styles.login} to={ROUTE_MAP.LOGIN}>
              返回登录
            </Link>
          </div>
        )}
      </Form>
    </LoginLayout>
  );
};

export default RegisterLayout;
