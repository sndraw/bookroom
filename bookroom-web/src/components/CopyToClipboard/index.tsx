import { CopyOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React from 'react';

type Props = {
  title?: string;
  icon?: React.ReactNode;
  content: string;
};
const CopyToClipboard: React.FC<Props> = (props) => {
  const { title = '复制', icon, content } = props;
  // 复制
  const copy = () => {
    // 调用粘贴板复制（兼容老版浏览器）
    function fallbackCopyTextToClipboard(text: string) {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          message.success(`${title}成功`);
        } else {
          message.error(`${title}失败`);
        }
      } catch (err) {
        console.error(`无法${title}文本:`, err);
        message.error(`${title}失败`);
      }

      document.body.removeChild(textArea);
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          message.success(`${title}成功`);
        })
        .catch((err) => {
          console.error(`无法${title}文本: `, err);
          fallbackCopyTextToClipboard(content);
        });
    } else {
      // Fallback for older browsers
      fallbackCopyTextToClipboard(content);
    }
  };
  return (
    <Button
      type="text"
      size="small"
      title={title}
      color="default"
      style={{ opacity: 0.6 }}
      onClick={() => {
        copy();
      }}
    >
      {icon || <CopyOutlined />}
    </Button>
  );
};
export default CopyToClipboard;
