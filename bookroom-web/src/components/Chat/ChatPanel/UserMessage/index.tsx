import classNames from 'classnames';
import React from 'react';
import { ChatMessageType } from '../types';

import { DeleteOutlined, RedoOutlined, UserOutlined } from '@ant-design/icons';
import MessageContent from '../MessageContent';

import { Button, Popconfirm } from 'antd';
import styles from './index.less';
import CopyToClipboard from '@/components/CopyToClipboard';

interface UserMessageType {
  msgObj: ChatMessageType;
  loading?: boolean;
  index: number; // 消息在消息列表中的索引
  messageList: ChatMessageType[]; // 消息列表
  handleReAnswer?: (id: string) => void; // 重新生成答案的处理函数
  handleDelete?: (id: string) => void; // 删除消息的处理函数
  className?: string;
}

const UserMessage: React.FC<UserMessageType> = (props) => {
  const {
    msgObj,
    index,
    messageList,
    handleReAnswer,
    handleDelete,
    loading,
    className,
  } = props;

  return (
    <div
      className={classNames(styles.messageItemWrapper, className)}
    >
      <div className={classNames(styles.messageItem, styles.messageUser)}>
        <div
          className={classNames(
            styles.messageContent,
            styles.messageContentUser,
          )}
        >
          <MessageContent msgObj={msgObj} />
          <div className={styles.messageFooter}>
            {/* 复制 */}
            <CopyToClipboard content={msgObj?.content} />
            {!loading && index === messageList?.length - 1 && (
              <>
                {handleReAnswer && (
                  <Button
                    type="link"
                    size="small"
                    title="重新生成"
                    onClick={() => {
                      handleReAnswer(msgObj?.id);
                    }}
                  >
                    <RedoOutlined />
                  </Button>
                )}
                {handleDelete && (
                  <Popconfirm
                    title="确定要删除这条消息吗？"
                    onConfirm={() => handleDelete(msgObj.id)}
                    cancelText="取消"
                    okText="确定"
                  >
                    {/* 删除 */}
                    <Button type="link" size="small" danger title="删除">
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}
          </div>
        </div>
        <div className={classNames(styles.messageRole, styles.messageRoleUser)}>
          <div
            className={classNames(
              styles.messageRoleText,
              styles.messageRoleTextUser,
            )}
          >
            <UserOutlined />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;
