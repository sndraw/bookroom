import { useState } from 'react';

const GlobalMessage = () => {
  type MessageType = 'success' | 'error' | 'info' | 'warning';
  const [msg, setMsg] = useState<{
    message: string;
    type?: MessageType;
  } | null>(null);
  return {
    namespace: 'globalMessage',
    msg,
    showMessage: (
      message: string | '提示信息',
      type?: MessageType | 'info',
    ) => {
      setMsg({
        message,
        type,
      });
    },
    hideMessage: () => {
      setMsg(null);
    },
  };
};

export default GlobalMessage;
