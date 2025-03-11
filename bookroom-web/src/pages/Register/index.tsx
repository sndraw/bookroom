import RegisterLayout from '@/layouts/RegisterLayout';
import { register } from '@/services/common/login';
import React from 'react';

const RegisterPage: React.FC = () => {
  return <RegisterLayout title="注册" requestApi={register} />;
};

export default RegisterPage;
