import CopyToClipboard from '@/components/CopyToClipboard';
import { MODE_ENUM } from '@/constants/DataMap';
import ROUTE_MAP from '@/routers/routeMap';
import {
  RobotOutlined,
  PlayCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { generatePath, Link, useAccess, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  List,
  message,
  Popconfirm,
  Space,
  Spin,
  Typography,
} from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './index.less';
import { deleteAgent } from '@/services/common/agent';
import AgentEdit from '../AgentEdit';

type AgentCardPropsType = {
  // 模式
  mode: MODE_ENUM;
  // 当前Agent
  item: API.AgentInfo;
  // 刷新
  refresh: () => void;
  // 样式
  className?: string;
};
const AgentCard: React.FC<AgentCardPropsType> = (props: AgentCardPropsType) => {
  const { item, refresh, className } = props;
  // 权限
  const access = useAccess();
  // 主题
  const { token } = useToken();
  const [loading, setLoading] = useState(false);

  const { getPlatformName, getPlatformCode } = useModel('agentplatformList');

  // 删除智能助手
  const handleDelete = async ({
    agent,
  }: {
    agent: string;
  }) => {
    if (!agent) return false;
    setLoading(true);
    try {
      await deleteAgent({
        agent: encodeURIComponent(agent.trim() || ''),
      });
      message.success(`删除成功`);
      return true;
    } catch (error: any) {
      return false;
    } finally {
      setLoading(false);
    }
  };
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
              src={<RobotOutlined />}
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
          description={
            <div className={styles.cardItemContent} key={item?.name}>
              {/* <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>转义名称：</div>
                <div className={styles?.nodeContent}>
                  {encodeURIComponent(item?.name)}
                </div>
              </div> */}
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>接口名称：</div>
                <div className={styles?.nodeContent}>{getPlatformName(item?.platformId ||'')}</div>
              </div>
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>接口类型：</div>
                <div className={styles?.nodeContent}>{getPlatformCode(item?.platformId ||'')}</div>
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
              <div className={styles?.cardItemNode}>
                <div className={styles?.nodeLabel}>描述：</div>
                <div className={classNames(styles?.nodeContent, styles?.description)} title={item?.description}>
                  {item?.description || '-'}
                </div>
              </div>
            </div>
          }
        />
        <Space className={classNames(styles.cardItemManage)}>
          <AgentEdit
            agent={item?.id}
            data={item}
            refresh={refresh}
            disabled={loading}
          />
          {/* pop提示 */}
          <Popconfirm
            disabled={loading}
            title={`确定要删除该智能助手吗？`}
            onConfirm={async () => {
              if (!item?.name) return false;
              const result = await handleDelete({
                agent: item?.id,
              }); // 刷新智能助手列表
              if (result) {
                refresh();
              }
            }}
          >
            <Button
              title="删除智能助手"
              type={'text'}
              danger
              icon={<CloseOutlined />}
            />
          </Popconfirm>
        </Space>
        <Space className={classNames(styles.cardItemActions)}>
          <Link
            title={'任务执行'}
            to={{
              pathname: generatePath(ROUTE_MAP.AGENT_TASK, {
                agent: item?.id,
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
              icon={<PlayCircleOutlined />}
            />
          </Link>
        </Space>
      </List.Item>
    </Spin>
  );
};

export default AgentCard;
