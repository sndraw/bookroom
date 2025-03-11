import CopyToClipboard from '@/components/CopyToClipboard';
import { MODE_ENUM } from '@/constants/DataMap';
import ROUTE_MAP from '@/routers/routeMap';
import {
  RobotOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Access, generatePath, Link, useAccess, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  List,
  Space,
  Spin,
  Typography,
} from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './index.less';

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
  const { mode, item, refresh, className } = props;
  // 权限
  const access = useAccess();
  // 主题
  const { token } = useToken();
  const [loading, setLoading] = useState(false);
  const canEdit = access.canSeeDev && mode === MODE_ENUM.EDIT;

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
              {item?.code && (
                <div className={styles?.cardItemNode}>
                  <div className={styles?.nodeLabel}>接口类型：</div>
                  <div className={styles?.nodeContent}>{item?.code}</div>
                </div>
              )}
              {/* admin权限 */}
              <Access accessible={canEdit}>
                {item?.host && (
                  <div className={styles?.cardItemNode}>
                    <div className={styles?.nodeLabel}>Agent地址：</div>
                    <div className={styles?.nodeContent}>
                      <Typography.Link href={item?.host} target="_blank">
                        {item?.host}
                      </Typography.Link>
                    </div>
                  </div>
                )}
              </Access>
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
            </div>
          }
        />
        {/* <Access accessible={canEdit}>
          <Space className={classNames(styles.cardItemManage)}>
          </Space>
        </Access> */}
        <Space className={classNames(styles.cardItemActions)}>
          <Link
            title={'任务执行'}
            to={{
              pathname: generatePath(ROUTE_MAP.AGENT_TASK, {
                agent: item?.name,
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
