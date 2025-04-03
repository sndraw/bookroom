import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import CopyToClipboard from '@/components/CopyToClipboard';
import { MODE_ENUM, STATUS_MAP } from '@/constants/DataMap';
import ROUTE_MAP from '@/routers/routeMap';
import {
  CloseOutlined,
  CommentOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  PoweroffOutlined,
  DesktopOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Access, generatePath, Link, useAccess } from '@umijs/max';
import {
  Avatar,
  Button,
  List,
  message,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import styles from './index.less';
import { LLM_FLAG_MAP } from '@/common/llm';
import LmEdit from '../LmEdit';
import { get } from 'http';
import { getAILmTypeNameList } from '@/services/common/ai/lm';

type LmCardPropsType = {
  // 模式
  mode: MODE_ENUM;
  // 表格列定义
  columns: any[];
  // 当前模型
  item?: API.AILmInfo;
  // 切换状态
  runItem?: (
    params: { platform: string; model: string },
    body: {
      status: number | string;
    },
  ) => void;
  // 删除
  deleteItem?: (params: { platform: string; model: string }) => void;
  // 刷新
  refresh: () => void;
  // 样式
  className?: string;
};
const LmCard: React.FC<LmCardPropsType> = (props: LmCardPropsType) => {
  const { mode, columns, item, refresh, runItem, deleteItem, className } = props;
  // 权限
  const access = useAccess();
  const canEdit = access.canSeeDev && mode === MODE_ENUM.EDIT;

  // 主题
  const { token } = useToken();
  const [loading, setLoading] = useState(false);
  /**
   * 修改模型状态
   * @param fields
   */
  const handleStatus = useCallback(
    async ({
      platform,
      model,
      status,
    }: {
      platform: string;
      model: string;
      status: number | string;
    }) => {
      if (!platform) return false;
      if (!model) return false;
      setLoading(true);
      try {
        const result: any = await runItem?.(
          {
            platform,
            model: encodeURIComponent(model.trim()),
          },
          {
            status: status,
          },
        );
        if (!result?.data) {
          throw `修改${model}失败`;
        }
        message.success(`修改成功`);
        return true;
      } catch (error: any) {
        // message.error(error?.message || '修改失败');
        return false;
      } finally {
        setLoading(false);
        refresh();
      }
    },
    [],
  );
  // 删除模型
  const handleDelete = useCallback(
    async ({ platform, model }: { platform: string; model: string }) => {
      if (!platform) return false;
      if (!model) return false;
      setLoading(true);
      try {
        await deleteItem?.({
          platform,
          model: encodeURIComponent(model.trim()),
        });
        message.success(`删除成功`);
        return true;
      } catch (error: any) {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  if (!item) {
    return <></>;
  }
  return (
    <Spin spinning={loading} tip="Loading..." key={item?.id}>
      <List.Item className={classNames(styles.cardItem, className)}>
        <List.Item.Meta
          className={styles.cardItemMeta}
          avatar={
            <Avatar
              className={styles.cardItemAvatar}
              src={<DesktopOutlined />}
              shape="square"
            />
          }
          title={
            <div className={styles.cardItemTitleWrapper}>
              <Typography.Text
                ellipsis
                title={item?.name}
                className={styles?.cardItemTitle}
              >
                {item?.name}
              </Typography.Text>
              {/* 复制 */}
              <CopyToClipboard content={item?.name} />
            </div>
          }
          // title={
          //   <div className={styles.cardItemTitle}>
          //     <Avatar
          //       className={styles.cardItemAvatar}
          //       src={<DesktopOutlined  />}
          //       shape="square"
          //     />
          //     <Divider type="vertical" />
          //   <span title={item?.name}>{item?.name}</span>
          //   </div>
          // }
          description={
            <div className={styles.cardItemContent} key={item?.name}>
              <Access
                accessible={item?.platformCode === AI_LM_PLATFORM_MAP?.ollama.value
                }
              >
                {item?.status && (
                  <div className={styles?.cardItemNode}>
                    <div className={styles?.nodeBox}>
                      <div className={styles?.nodeStatus}>
                        {item?.status === STATUS_MAP.ENABLE.value && (
                          <>
                            <Tag
                              style={{ marginRight: 0 }}
                              color="processing"
                              icon={<SyncOutlined spin />}
                            >
                              {STATUS_MAP.ENABLE.text}
                            </Tag>
                          </>
                        )}
                        {item?.status === STATUS_MAP.DISABLE.value && (
                          <Tag
                            style={{ marginRight: 0 }}
                            color="error"
                            icon={<ExclamationCircleOutlined />}
                          >
                            {STATUS_MAP.DISABLE.text}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </Access>
              {!!item?.size && (
                <div className={styles?.cardItemNode}>
                  <div className={styles?.nodeLabel}>模型大小：</div>
                  <div className={styles?.nodeContent}>
                    {item?.size
                      ? (item?.size / 1024 / 1024 / 1024).toFixed(2) + 'G'
                      : '——'}
                  </div>
                </div>
              )}
              {!!item?.details?.quantization_level && (
                <div className={styles?.cardItemNode}>
                  <div className={styles?.nodeLabel}>量化等级：</div>
                  <div className={styles?.nodeContent}>
                    {item?.details?.quantization_level || '——'}
                  </div>
                </div>
              )}
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>接口名称：</div>
                <div className={styles?.nodeContent}>{item?.platform}</div>
              </div>
              {/* admin权限 */}
              <Access accessible={canEdit}>
                {item?.platformCode && (
                  <div className={styles?.cardItemNode}>
                    <div className={styles?.nodeLabel}>接口类型：</div>
                    <div className={styles?.nodeContent}>
                      {item?.platformCode}
                    </div>
                  </div>
                )}
                {item?.platformHost && (
                  <div className={styles?.cardItemNode}>
                    <div className={styles?.nodeLabel}>平台地址：</div>
                    <div className={styles?.nodeContent}>
                      <Typography.Link
                        href={item?.platformHost}
                        target="_blank"
                      >
                        {item?.platformHost}
                      </Typography.Link>
                    </div>
                  </div>
                )}
              </Access>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>创建时间：</div>
                <div className={styles?.nodeContent}>
                  {item?.createdAt ? new Date(item?.createdAt).toLocaleString() : '-'}
                </div>
              </div>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>更新时间：</div>
                <div className={styles?.nodeContent}>
                  {item?.updatedAt ? new Date(item?.updatedAt).toLocaleString() : '-'}
                </div>
              </div>
              <Access
                accessible={item?.platformCode !== AI_LM_PLATFORM_MAP?.ollama.value
                }
              >
                <div className={classNames(styles.cardItemNode,styles?.cardItemTag)}>
                    {item?.type &&
                      <Tag
                        color='default'
                        className={styles?.nodeTypeTag}
                        title={getAILmTypeNameList(item?.type).join(" | ")}>
                        {getAILmTypeNameList(item?.type).join(" | ")}
                      </Tag>
                    }
                </div>
              </Access>
            </div>
          }
        />
        <Access
          accessible={
            canEdit && (item?.platformCode === AI_LM_PLATFORM_MAP?.ollama.value || item?.flag === LLM_FLAG_MAP.USER.value)
          }
        >
          <Space className={classNames(styles.cardItemManage)}>
            <LmEdit
              platform={item?.platformId}
              model={item?.model}
              data={item}
              columns={columns}
              refresh={refresh}
              disabled={loading} />
            {/* pop提示 */}
            <Popconfirm
              disabled={loading}
              title={`确定要删除该模型吗？`}
              onConfirm={async () => {
                if (!item?.platform) return false;
                if (!item?.model) return false;
                const result = await handleDelete({
                  platform: item?.platform,
                  model: item?.model,
                });
                if (result) {
                  refresh();
                }
              }}
            >
              <Button
                title="删除模型"
                type={'text'}
                danger
                icon={<CloseOutlined />}
              />
            </Popconfirm>
          </Space>
        </Access>


        <Space className={classNames(styles.cardItemActions)}>
          <Link
            title={'多轮对话'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_LM_CHAT, {
                platform: item?.platformId,
                model: encodeURIComponent(item?.name),
              }),
            }}
          // target="_blank"
          >
            <Button
              type="text"
              style={{
                color: token.colorLink,
              }}
              size="large"
              icon={<CommentOutlined />}
            />
          </Link>
          <Link
            title={'文本补全'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_LM_GENERATE, {
                platform: item?.platformId,
                model: encodeURIComponent(item?.name),
              }),
            }}
          // target="_blank"
          >
            <Button
              type="text"
              style={{
                color: token.colorLink,
              }}
              size="large"
              icon={<MessageOutlined />}
            />
          </Link>
          <Link
            title={'嵌入向量'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_LM_EMBED, {
                platform: item?.platformId,
                model: encodeURIComponent(item?.name),
              }),
            }}
          // target="_blank"
          >
            <Button
              type="text"
              style={{
                color: token.colorLink,
              }}
              size="large"
              icon={<DatabaseOutlined />}
            />
          </Link>
          {/* <Access
            accessible={item?.platformCode === AI_LM_PLATFORM_MAP?.openai.value}
          >
            <Link
              title={'图片生成'}
              to={{
                pathname: generatePath(ROUTE_MAP.AI_LM_IMAGE, {
                  platform: item?.platform,
                  model: encodeURIComponent(item?.name),
                }),
              }}
            // target="_blank"
            >
              <Button
                type="text"
                style={{
                  color: token.colorLink,
                }}
                size="large"
                icon={<FileImageOutlined />}
              />
            </Link>
          </Access> */}

          <Access
            accessible={canEdit && item?.platformCode === AI_LM_PLATFORM_MAP?.ollama.value
            }
          >
            {item?.status === STATUS_MAP.DISABLE.value && (
              <Button
                disabled={loading}
                title={'启动'}
                type="text"
                icon={
                  <PoweroffOutlined
                    style={{
                      color: token.colorSuccess,
                    }}
                  />
                }
                onClick={(event) => {
                  event?.stopPropagation?.();
                  event?.preventDefault?.();
                  handleStatus({
                    platform: item?.platform,
                    model: encodeURIComponent(item?.name),
                    status: STATUS_MAP.ENABLE.value,
                  });
                }}
              ></Button>
            )}

            {item?.status === STATUS_MAP.ENABLE.value && (
              <Button
                disabled={loading}
                title={'停止'}
                type="text"
                icon={
                  <PoweroffOutlined
                    style={{
                      color: token.colorError,
                    }}
                  />
                }
                onClick={(event) => {
                  event?.stopPropagation?.();
                  event?.preventDefault?.();
                  handleStatus({
                    platform: item?.platform,
                    model: encodeURIComponent(item?.name),
                    status: STATUS_MAP.DISABLE.value,
                  });
                }}
              ></Button>
            )}
          </Access>
        </Space>
      </List.Item>
    </Spin>
  );
};

export default LmCard;
