import classNames from 'classnames';
import React from 'react';
import { ChatMessageType } from '../types';

import { DeleteOutlined, RedoOutlined, RobotOutlined  } from '@ant-design/icons';

import CopyToClipboard from '@/components/CopyToClipboard';
import {
  getNoTagsContent,
  markdownToText,
  MarkdownWithHighlighting,
} from '@/components/Markdown';
import TextToSpeech from '@/components/Voice/TextToSpeech';
import { Button, Popconfirm } from 'antd';
import styles from './index.less';

interface AssistantMessageType {
  msgObj: ChatMessageType;
  index: number; // 消息在消息列表中的索引
  messageList: ChatMessageType[]; // 消息列表
  handleReAnswer?: (id: string) => void; // 重新生成答案的处理函数
  handleDelete?: (id: string) => void; // 删除消息的处理函数
  loading?: boolean; // 是否正在加载中
  className?: string;
}

const AssistantMessage: React.FC<AssistantMessageType> = (props) => {
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
      key={msgObj?.id}
      className={classNames(styles.messageItemWrapper, className)}
    >
      <div className={classNames(styles.messageItem, styles.messageAssistant)}>
        <div
          className={classNames(
            styles.messageRole,
            styles.messageRoleAssistant,
          )}
        >
          <div
            className={classNames(
              styles.messageRoleText,
              styles.messageRoleTextAssistant,
            )}
          >
            <RobotOutlined  />
          </div>
        </div>
        <div
          className={classNames(
            styles.messageContent,
            styles.messageContentAssistant,
          )}
        >
          <MarkdownWithHighlighting markdownContent={msgObj?.content} />
          {!loading && (
            <div className={styles.messageFooter}>
              {/* 语音播放 */}
              <TextToSpeech
                key={msgObj?.id}
                speekId={msgObj?.id}
                content={markdownToText(
                  getNoTagsContent(msgObj?.content),
                )}
              />
              {/* 复制 */}
              <CopyToClipboard content={msgObj?.content} />
              {/* 重新生成 */}
              {index === messageList?.length - 1 && handleReAnswer && (
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
              {/* 气泡确认删除 */}
              {index === messageList?.length - 1 && handleDelete && (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
