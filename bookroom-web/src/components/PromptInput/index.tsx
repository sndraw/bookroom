// 提示词输入组件
import { Input } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';
interface PromptInputProps {
  prompt: string;
  onChange: (prompt: string) => void;
  title?: string;
  className?: string;
}
const PromptInput: React.FC<PromptInputProps> = (props) => {
  const { prompt, onChange, title, className } = props;

  return (
    <div className={classNames(styles.panel, className)}>
      <Input.TextArea
        placeholder={title || '请输入提示词'}
        value={prompt}
        maxLength={1024}
        showCount
        onChange={(event) => {
          onChange(event.target.value);
        }}
        rows={1}
      />
    </div>
  );
};

export default PromptInput;
