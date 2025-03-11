import { useState } from 'react';

const GlobalLoading = () => {
  const [loading, setLoading] = useState<boolean>(false);
  return {
    namespace: 'globalLoading',
    loading,
    showLoading: () => {
      setLoading(true);
    },
    hideLoading: () => {
      setLoading(false);
    },
  };
};

export default GlobalLoading;
