import useHeaderHeight from '@/hooks/useHeaderHeight';
import {
  ClearOutlined,
  DownOutlined,
  PauseCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Divider, Form, Input, message, Popconfirm, Space } from 'antd';
import classNames from 'classnames';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import VoiceChat from '../../Voice/VoiceChat';
import AssistantMessage from './AssistantMessage';
import { ChatMessageType } from './types';
import UserMessage from './UserMessage';
import { voiceRecognizeTask } from '@/services/common/voice';
import { getUrlAndUploadFileApi } from '@/services/common/file';
import { formatSseData, isSseFormat } from '@/utils/format';
import ImageUpload, { ImageListType } from '../../Image/ImageUpload';
import ImageListPanel from '../../Image/ImageListPanel';
import { AudioParamsType } from '../../Voice/AudioParamsSelect';
import FileLinkUpload from '@/components/File/FileLinkUpload';
import styles from './index.less';
import FileListPanel from '@/components/File/FileListPanel';
import FileUpload, { FileListType } from '@/components/File/FileUpload';
import { isAudio, isImage, isMediaObjectId, isVideo } from '@/utils/file';

type ChatPanelPropsType = {
  // 标题
  title?: string;
  // 默认消息列表
  defaultMessageList?: ChatMessageType[];
  // 请求方法
  customRequest: (data: any, options: any) => Promise<any>;
  // 保存AI聊天记录
  saveAIChat?: (values: any) => void;
  // 消息发送
  onSend?: (values: any[]) => void;
  // 消息发送
  onStop?: () => void;
  // 消息删除
  onDelete?: (values: any[]) => void;
  // 消息清除
  onClear?: () => void;
  // 是否禁用
  disabled?: boolean;
  // 样式
  className?: string;
  // 刷新
  refresh?: () => void;
  // 子组件
  children?: ReactNode;
  // 额外的发送选项
  sendOptions?: {
    // 发送消息的占位符
    sendPlaceholder?: string;
    // 是否支持文件上传
    isFiles?: boolean;
    // 文件上传前缀
    filePrefix?: string;
    // 是否支持图片上传
    isImages?: boolean;
    // 音频输出参数
    audioParams?: AudioParamsType;
    // 是否支持语音识别
    isVoice?: boolean;
    // 语音识别参数
    voiceParams?: API.VoiceParamsType;
  };
};
const ChatPanel: React.FC<ChatPanelPropsType> = (props) => {
  const {
    title,
    defaultMessageList,
    customRequest,
    saveAIChat,
    onSend,
    onStop,
    onDelete,
    onClear,
    disabled,
    className,
    sendOptions
  } = props;
  // 额外的参数
  const {
    sendPlaceholder = "请发送一条消息...",
    isFiles = false,
    filePrefix = '',
    isImages = false,
    isVoice = false,
    audioParams = {},
    voiceParams
  } = sendOptions || {};
  const [messageList, setMessageList] = useState<ChatMessageType[]>([]);
  const [imageList, setImageList] = useState<ImageListType>();
  const [fileList, setFileList] = useState<FileListType>();
  const [videoList, setVideoList] = useState<any[]>([]);


  const [loading, setLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  const [form] = Form.useForm();

  const headerHeight = useHeaderHeight();
  const messageListRef = useRef<HTMLDivElement>(null);
  const messageListEndRef = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);
  // 发送
  const handleSend = async (newMessageList: ChatMessageType[]) => {
    if (loading) {
      return;
    }
    if (!newMessageList) {
      return;
    }
    setMessageList([...newMessageList]);
    await saveAIChat?.([...newMessageList]);

    abortController.current = new AbortController();
    const answerId = btoa(Math.random().toString());
    const initAnswerContent = '';
    const newResMessage: ChatMessageType = {
      id: answerId,
      role: 'assistant',
      content: initAnswerContent,
      createdAt: new Date(),
    };
    setMessageList([...newMessageList, newResMessage]);
    let responseData: any = "";
    try {
      setLoading(true);
      const res = await customRequest(
        {
          messages: newMessageList,
        },
        {
          signal: abortController?.current?.signal,
        },
      ).then(async (res) => {
        const { response, reader, decoder } = res as any;
        // 判定非流式输出
        if (!response) {
          // 如果res是string格式，直接解析
          if (!res?.ok) {
            let resObj: any = res;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              resObj = await res?.json?.();
            }
            responseData = resObj?.message || res?.statusText || '生成失败';
          } else {
            let resObj: any = res;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              resObj = await res?.json?.();
            }
            responseData = resObj?.data || resObj?.results || resObj?.content || '生成失败';
          }
          // 如果responseData是JSON格式，直接解析
          if (typeof responseData === 'string') {
            newResMessage.content = responseData;
          } else {
            newResMessage.content =
              '```json\n' + JSON.stringify(responseData, null, 2) + '\n```';
          }
          newMessageList.push(newResMessage);
          setMessageList([...newMessageList]);
          return res;
        }
        // 流式输出判定
        if (!response?.ok) {
          const errorData = await response?.json();
          throw new Error(errorData?.message || '生成失败');
        }

        const updateProgress = async (chunk: any) => {
          if (!chunk?.done && chunk?.value) {
            const content = decoder.decode(chunk?.value, { stream: true });
            // 如果是SSE数据格式，处理SSE数据
            if (content && isSseFormat(content)) {
              // 处理SSE数据并更新responsedatapath
              const formattedStr = formatSseData(content);
              if (formattedStr) {
                responseData += formattedStr;
              }
            } else {
              responseData += content;
            }
            // Update UI
            const currentMsgIndex = newMessageList.findIndex((item) => item.id === answerId);
            if (currentMsgIndex > -1) {
              newMessageList[currentMsgIndex] = {
                ...newMessageList[currentMsgIndex],
                content: responseData
              };
            } else {
              newMessageList.push({
                id: answerId,
                role: 'assistant',
                content: responseData,
                createdAt: new Date(),
              });
            }
            setMessageList([...newMessageList]);
          }
          if (chunk?.done) {
            return;
          }
          await reader?.read().then(updateProgress);
        };

        await reader?.read().then(updateProgress);
        return response;
      })
    } catch (error: any) {
      let errorData = null;
      if (error?.name === 'AbortError') {
        errorData = { message: '请求被终止' };
      } else {
        try {
          errorData = (await error?.json?.()) || error;
        } catch (e) {
          errorData = error?.info || error;
        }
      }
      // 查找并更新消息列表
      if (
        !newMessageList.find((item: { id: string }) => item.id === answerId)
      ) {
        responseData =
          '消息未得到正确回复：' + (errorData?.message || errorData?.error || errorData || "未知错误");
        const resMessage = {
          id: btoa(Math.random().toString()),
          role: 'assistant',
          content: responseData,
          createdAt: new Date(),
        };
        newMessageList.push(resMessage);
      }
      setMessageList([...newMessageList]);
      console.error('请求异常：', error);
    } finally {
      setLoading(false);
      saveAIChat?.(newMessageList);
    }
  };

  // 终止
  const handleStop = () => {
    abortController?.current?.abort();
    if (onStop) {
      onStop?.();
    }
  };

  // 计算样式
  const containerStyle = useCallback(() => {
    return {
      height: `calc(100vh - ${headerHeight}px)`,
    };
  }, [headerHeight]);

  useEffect(() => {
    const handleScroll = () => {
      if (messageListRef.current) {
        // 判断是否有滚动条
        const hasScrollbar =
          messageListRef.current.scrollHeight >
          messageListRef.current.clientHeight;

        // 离开底部时出现
        const isAtBottom =
          messageListRef.current.scrollTop +
          messageListRef.current.clientHeight >=
          messageListRef.current.scrollHeight - 50;

        // 如果不在底部，则显示按钮
        setIsButtonVisible(!isAtBottom && hasScrollbar);
      }
    };

    if (messageListRef.current) {
      messageListRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (messageListRef.current) {
        messageListRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (defaultMessageList) {
      setMessageList(defaultMessageList);
    }
  }, [defaultMessageList]); // 监听消息变化

  const scrollToBottom = () => {
    // 如果已经底部，则滚动
    messageListEndRef?.current?.scrollIntoView({ behavior: 'smooth' }); // 滚动到底部
  };

  useEffect(() => {
    if (!isButtonVisible) {
      scrollToBottom();
    }
  }, [messageList]); // 监听消息变化

  // 提交
  const handleSubmit = async (values: any) => {
    if (loading) {
      return;
    }
    const { msg, voice } = values;
    // 如果没有语音输入，且没有文本输入，则不提交
    if (!msg?.trim() && !voice) {
      return;
    }
    if (!msg?.trim() && !imageList?.objectList?.length && !videoList?.length) {
      return;
    }
    form.resetFields();
    const newMessage: ChatMessageType = {
      id: btoa(Math.random().toString()),
      role: 'user',
      content: [
        {
          type: 'text',
          text: msg?.trim(),
        },
      ],
      createdAt: new Date(),
    };
    if (isFiles && fileList?.objectList?.length) {
      newMessage.images = fileList?.objectList?.filter(item => {
        return isImage(item.objectId)
      }).map(item => item.objectId);
      newMessage.audios = fileList?.objectList?.filter(item => {
        return isAudio(item.objectId)
      }).map(item => item.objectId);
      newMessage.videos = fileList?.objectList?.filter(item => {
        return isVideo(item.objectId)
      }).map(item => item.objectId);
      newMessage.files = fileList?.objectList?.filter(item => {
        return !isMediaObjectId(item.objectId)
      }).map(item => {
        return {
          id: item?.id,
          name: item?.name || item?.id,
          objectId: item.objectId || item?.id,
        }
      });
      setFileList(undefined);
    }
    // 如果是图片上传
    if (isImages && imageList?.objectList?.length) {
      const newImageObjList = imageList?.objectList?.map(item => item.objectId) || []
      newMessage.images = [...(newMessage.images || []), ...newImageObjList]
      setImageList(undefined);
    }
    // 如果是语音上传
    if (voice) {
      newMessage.audios = [...(newMessage.audios || []), voice]
    }
    const newMessageList = [...messageList, newMessage];
    handleSend?.(newMessageList);
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  // 处理语音消息
  const handleVoiceMessage = async (audioBlob: any) => {
    try {
      // let audioBlobUrl = audioBlob;
      // if (typeof audioBlob === 'string') {
      //   const audio = new Audio(audioBlob);
      //   audio.play();
      // }
      if (audioBlob instanceof Blob) {
        setVoiceLoading(true)
        // 上传音频文件到服务器 type: 'audio/wav'
        const objectId = new Date().getTime() + '_' + 'voice.wav';
        // 上传文件
        const isUploaded = await getUrlAndUploadFileApi(
          {
            objectId,
          },
          {
            file: new File([audioBlob], objectId, { type: 'audio/wav' }),
          },
        );
        if (!isUploaded) {
          return;
        }
        if (!voiceParams?.apiMode) {
          // 提交消息
          setTimeout(() => {
            setFileList(prevState => ({
              objectList: [...(prevState?.objectList || []), {
                id: objectId,
                objectId,
              }],
              fileList: [...(prevState?.fileList || [])]
            }));
            // handleSubmit({
            //   msg: form.getFieldValue('msg') || '请识别该语音并回复消息',
            //   voice: objectId,
            // });
          }, 500);
          return;
        }
        if (!voiceParams?.id) {
          message.error("请先配置语音识别参数");
          return;
        }
        // 调用语音识别接口
        const response: any = await voiceRecognizeTask({
          id: voiceParams?.id,
          is_stream: false
        }, {
          voiceData: objectId,
          language: voiceParams?.language,
          task: voiceParams?.task
        });
        if (!response?.ok) {
          throw response?.statusText;
        } else {
          const res = await response?.json();
          if (res?.data) {
            let msg = form.getFieldValue('msg') || "";
            if (msg) {
              msg += '\n'
            }
            msg += res?.data?.trim();
            form.setFieldValue('msg', msg);
          }
        }
      }
    } catch (error: any) {
      message.error(error?.message || error?.info || error || "语音识别失败");
    } finally {
      setVoiceLoading(false)
    }
  };

  const handleInputChange = (e: any) => {
    const value = e.target.value?.trim();
    // form.setFieldsValue({ msg: value });
  };

  // 监听input的键盘事件，当Ctrl和enter，提交form
  const handleKeyDown = (e: any) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      form.submit();
      return;
    }
  };
  // 删除对话
  const handleDelete = (messageId: string) => {
    if (!messageId) {
      return;
    }
    const newMessageList = messageList.filter((item) => item.id !== messageId);
    setMessageList([...newMessageList]);
    saveAIChat?.([...newMessageList]);
  };

  // 重置对话
  const handleReAnswer = (messageId: string) => {
    if (!messageId) {
      return;
    }
    // 如果当前选中的消息是用户消息
    const currentMessage = messageList.find((item) => item.id === messageId);
    if (currentMessage && currentMessage.role === 'user') {
      handleSend?.(messageList);
      return;
    }
    const newMessageList = messageList.filter((item) => item.id !== messageId);
    handleSend?.(newMessageList);
  };

  // 停止对话
  const handleStopAnswer = () => {
    // TODO: 停止对话
    if (handleStop) {
      handleStop?.();
    }
  };

  // 清空对话
  const handleClear = () => {
    setMessageList([]);
    saveAIChat?.([]);
  };


  return (
    <div
      className={classNames(styles.container, className)}
      style={containerStyle()}
    >
      {title && <div className={styles.title}>{title}</div>}
      {props?.children}
      <div className={styles.messageListWrapper} ref={messageListRef}>
        <div className={styles.messageList}>
          {messageList?.map((msgObj, index) =>
            msgObj?.role === 'user' ? (
              <UserMessage
                key={msgObj?.id}
                messageList={messageList}
                msgObj={msgObj}
                index={index}
                loading={loading}
                handleDelete={handleDelete}
                handleReAnswer={handleReAnswer}
              />
            ) : (
              <AssistantMessage
                key={msgObj?.id}
                messageList={messageList}
                msgObj={msgObj}
                index={index}
                loading={loading}
                handleDelete={handleDelete}
                handleReAnswer={handleReAnswer}
              />
            ),
          )}
          <div ref={messageListEndRef} /> {/* 添加引用 */}
        </div>
        {/* 添加悬浮按钮，离开底部时出现，回到底部 */}
        {isButtonVisible && (
          <Button
            ghost
            className={styles.scrollToBottomButton}
            shape="circle"
            type="primary"
            icon={<DownOutlined />}
            onClick={scrollToBottom}
          />
        )}
      </div>
      <Form
        className={styles.inputForm}
        form={form}
        onFinish={handleSubmit}
        disabled={disabled}
      >
        <div className={styles.inputTextAreaWrapper}>
          <Space wrap size={10} direction={'horizontal'} className={styles.previewPanel}>
            {isImages && (<ImageListPanel dataList={imageList} setDataList={setImageList} />)}
            <FileListPanel dataList={fileList} setDataList={setFileList} />
          </Space>
          <Space wrap size={0} direction={'horizontal'} className={styles.inputTextAreaBtns}>
            <Popconfirm
              className={styles.clearButton}
              disabled={disabled || loading || voiceLoading}
              title={`确定要清空对话吗？`}
              onConfirm={handleClear}
            >
              <Button
                title={'清空对话'}
                icon={<ClearOutlined />}
                disabled={disabled || loading || voiceLoading}
                type={"text"}
              ></Button>
            </Popconfirm>
            {isFiles && (
              <>
                <Divider type="vertical" />
                <div className={styles.inputFiles}>
                  <FileLinkUpload
                    btnType='text'
                    handleUpload={values => {
                      if (values && values?.links?.length > 0) {
                        const newObjectIdList = values?.links.map((link: any) => ({
                          id: link?.url,
                          objectId: link?.url
                        }));
                        setFileList(prevState => ({
                          objectList: [...(prevState?.objectList || []), ...newObjectIdList],
                          fileList: [...(prevState?.fileList || [])]
                        }));
                      }
                    }}
                  />
                </div>
                <Divider type="vertical" />
                <div className={styles.inputFiles}>
                  <FileUpload
                    btnType='text'
                    isAutoOverwrite={true}
                    prefix={`${filePrefix}`}
                    handleUpload={values => {
                      if (values && values?.objectList?.length > 0) {
                        const newObjectIdList = values?.objectList.map((link: any) => ({
                          id: link?.id,
                          name: link?.filename,
                          objectId: link?.objectId
                        }));
                        setFileList(prevState => ({
                          objectList: [...(prevState?.objectList || []), ...newObjectIdList],
                          fileList: [...(prevState?.fileList || [])]
                        }));
                      }
                    }}
                  />
                </div>
              </>
            )}
            {isImages && (
              <>
                <Divider type="vertical" />
                <div className={styles.inputImages}>
                  <ImageUpload
                    title="上传图片"
                    listType="text"
                    multiple={true}
                    showUploadList={false}
                    max={5}
                    imageList={imageList}
                    setImageList={setImageList}
                  />
                </div>
              </>
            )}

          </Space>
          <div className={styles.inputTextAreaContainer}>
            {isVoice && (
              <VoiceChat
                voiceParams={voiceParams}
                className={styles?.voiceChat}
                disabled={disabled || loading || voiceLoading}
                onRecordStart={() => { }}
                onRecordStop={(audioBlob) => {
                  handleVoiceMessage(audioBlob);
                }}
              />
            )}
            <Form.Item name="msg" className={styles.inputTextAreaItem}>
              <Input.TextArea
                placeholder={sendPlaceholder}
                allowClear={false}
                className={styles.inputTextArea}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                autoSize={{ minRows: 1, maxRows: 4 }}
                rows={1}
              />
            </Form.Item>
            {/* 发送按钮 */}
            {!loading && (
              <Button
                className={styles.inputTextAreaSendBtn}
                type="primary"
                shape="circle"
                htmlType="submit"
                loading={loading}
                disabled={disabled || voiceLoading}
                title="发送(Ctrl+Enter)"
              >
                <SendOutlined />
              </Button>
            )}

            {/* 停止按钮 */}
            {loading && (
              <Button
                className={styles.inputTextAreaStopBtn}
                ghost
                type="primary"
                shape="circle"
                htmlType="button"
                title="停止"
                onClick={handleStopAnswer}
                disabled={disabled}
              >
                <PauseCircleOutlined />
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ChatPanel;
