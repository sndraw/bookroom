import { STATUS_MAP } from '@/constants/DataMap';
import {
  CloseOutlined,
  UnlockOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import {
  Button,
  Divider,
  List,
  message,
  Popconfirm,
  Space,
  Spin,
  Typography,
} from 'antd';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import styles from './index.less';
import PlatformEdit from '../PlatformEdit';
import { deletePlatform, getPlatformCodeList, getPlatformTypeList, updatePlatform, updatePlatformStatus } from '@/services/common/platform';

type PlatformCardPropsType = {
  // columns
  columns: any;
  // 当前Platform
  item: API.PlatformInfo;
  // 刷新
  refresh: () => void;
  // 样式
  className?: string;
};
const PlatformCard: React.FC<PlatformCardPropsType> = (props: PlatformCardPropsType) => {
  const { columns, item, refresh, className } = props;
  // 权限
  const access = useAccess();
  // 主题
  const { token } = useToken();
  const [loading, setLoading] = useState(false);

  /**
   * 更新平台
   */
  const handleUpdate = useCallback(
    async (platformId: string, fields: API.PlatformInfoVO) => {
      if (!platformId) return false;
      setLoading(true);
      try {
        // 如果parameters是字符串
        if (fields?.parameters && typeof fields?.parameters === 'string') {
          fields.parameters = JSON.parse(fields.parameters);
        }
        // 如果status存在
        if (fields?.status) {
          fields.status = Number(fields.status);
        }
        const result = await updatePlatform(
          {
            platform: platformId || '',
          },
          {
            ...fields,
          },
        );
        if (!result?.data) {
          throw `修改${fields?.name}失败`;
        }
        message.success('修改成功');
        return true;
      } catch (error: any) {
        // message.error(error?.message || '修改失败');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  // 删除平台
  const handleDelete = async ({
    platform,
  }: {
    platform: string;
  }) => {
    if (!platform) return false;
    setLoading(true);
    try {
      await deletePlatform({
        platform: platform,
      });
      message.success(`删除成功`);
      return true;
    } catch (error: any) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 修改平台状态
   */
  const handleModifyPlatformStatus = useCallback(
    async (platformId: string, status: number | string) => {
      if (!platformId) return false;
      // 待修改状态-文本
      setLoading(true);
      try {
        const result = await updatePlatformStatus(
          {
            platform: platformId,
          },
          {
            status: status,
          },
        );
        if (!result?.data) {
          throw `修改${platformId}失败`;
        }
        message.success(`修改成功`);
        return true;
      } catch (error: any) {
        // message.error(error?.message || '修改失败');
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
          // avatar={
          //   <Avatar
          //     className={styles.cardItemAvatar}
          //     src={<RobotOutlined />}
          //     shape="square"
          //   />
          // }
          title={
            <div className={styles.cardItemTitleWrapper}>
              <Typography.Text
                ellipsis
                title={item?.name}
                className={styles?.cardItemTitle}
              >
                {item?.name}
              </Typography.Text>
            </div>
          }
          description={
            <div className={styles.cardItemContent} key={item?.name}>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>配置类型：</div>
                <div className={styles?.nodeContent}>{getPlatformTypeList(item?.type)?.text}</div>
              </div>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>接口类型：</div>
                <div className={styles?.nodeContent}>{getPlatformCodeList({ code: item?.code })?.[0]?.label || item?.code}</div>
              </div>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>接口地址：</div>
                <div className={styles?.nodeContent}>
                  <a className={styles?.nodeLink} href={item?.host} title={item?.host} target="_blank">
                    {item?.host}
                  </a>
                </div>
              </div>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>API Key：</div>
                <div className={styles?.nodeContent}>{item?.apiKey || '-'}</div>
              </div>
              {item?.createdAt && (
                <div className={styles?.cardItemNode}>
                  <div className={styles?.nodeLabel}>创建时间：</div>
                  <div className={styles?.nodeContent}>
                    {new Date(item?.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
              {item?.updatedAt && (
                <div className={styles?.cardItemNode}>
                  <div className={styles?.nodeLabel}>修改时间：</div>
                  <div className={styles?.nodeContent}>
                    {new Date(item?.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}
              <div className={classNames(styles.cardItemNode, styles.cardItemNode_description)}>
                <Divider orientation="center" plain className={styles?.dividerLabel}>
                  描述
                </Divider>
                <div className={classNames(styles?.nodeContent, styles?.description)} title={item?.description}>
                  {item?.description || '无'}
                </div>
              </div>
            </div>
          }
        />
        <Space className={classNames(styles.cardItemManage)}>
          <PlatformEdit
            columns={columns}
            data={item}
            onFinished={(values) => handleUpdate(item.id, values)}
            refresh={refresh}
            disabled={loading}
          />
          {/* pop提示 */}
          <Popconfirm
            disabled={loading}
            title={`确定要删除该平台吗？`}
            onConfirm={async () => {
              if (!item?.name) return false;
              const result = await handleDelete({
                platform: item?.id,
              });
              // 刷新平台列表
              if (result) {
                refresh();
              }
            }}
          >
            <Button
              title="删除平台"
              type={'text'}
              danger
              icon={<CloseOutlined />}
            />
          </Popconfirm>
        </Space>
        <Space className={classNames(styles.cardItemActions)}>
          <>
            {item?.status === STATUS_MAP.DISABLE.value && (
              <Button
                disabled={loading}
                title={'已禁用'}
                type="text"
                icon={
                  <LockOutlined
                    style={{
                      color: token.colorError,
                    }}
                  />
                }
                onClick={async (event) => {
                  event?.stopPropagation?.();
                  event?.preventDefault?.();
                  const result = await handleModifyPlatformStatus(item?.id, STATUS_MAP.ENABLE.value);
                  // 刷新平台列表
                  if (result) {
                    refresh();
                  }
                }}
              ></Button>
            )}

            {item?.status === STATUS_MAP.ENABLE.value && (
              <Button
                disabled={loading}
                title={'已启用'}
                type="text"
                icon={
                  <UnlockOutlined
                    style={{
                      color: token.colorSuccess,
                    }}
                  />
                }
                onClick={async (event) => {
                  event?.stopPropagation?.();
                  event?.preventDefault?.();
                  const result = await handleModifyPlatformStatus(item?.id, STATUS_MAP.DISABLE.value);
                  // 刷新平台列表
                  if (result) {
                    refresh();
                  }
                }}
              ></Button>
            )}
          </>
        </Space>
      </List.Item>
    </Spin>
  );
};

export default PlatformCard;
