import CopyToClipboard from '@/components/CopyToClipboard';
import { MODE_ENUM } from '@/constants/DataMap';
import ROUTE_MAP from '@/routers/routeMap';
import { deleteGraphWorkspace } from '@/services/common/ai/graph';
import {
  BranchesOutlined,
  CloseOutlined,
  FolderOpenOutlined,
  MessageOutlined,
  NodeIndexOutlined,
  SnippetsOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Access, generatePath, Link, useAccess, useModel } from '@umijs/max';
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
import GraphWorkspaceSave, {
  GraphWorkSpaceActionEnum,
} from '../GraphWorkSpaceSave';
import styles from './index.less';
import { AI_GRAPH_PLATFORM_MAP } from '@/common/ai';

type GraphCardPropsType = {
  // 模式
  mode: MODE_ENUM;
  // 当前图谱空间
  item: API.AIGraphWorkspaceInfo;
  // 刷新
  refresh: () => void;
  // 样式
  className?: string;
};
const GraphCard: React.FC<GraphCardPropsType> = (props: GraphCardPropsType) => {
  const { mode, item, refresh, className } = props;
  // 权限
  const access = useAccess();
  // 主题
  const { token } = useToken();
  const [loading, setLoading] = useState(false);
  const canEdit = access.canSeeDev && mode === MODE_ENUM.EDIT;

  // 删除图谱空间
  const handleDelete = async ({
    graph,
    workspace,
  }: {
    graph: string;
    workspace: string;
  }) => {
    if (!graph) return false;
    if (!workspace) return false;
    setLoading(true);
    try {
      await deleteGraphWorkspace({
        graph,
        workspace: encodeURIComponent(workspace.trim() || ''),
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
              src={<BranchesOutlined />}
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
              {/* 转义复制 */}
              <CopyToClipboard
                title="转义复制"
                icon={<SnippetsOutlined />}
                content={encodeURIComponent(item?.name)}
              />
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
                <div className={styles?.nodeLabel}>图谱名称：</div>
                <div className={styles?.nodeContent}>{item?.graph}</div>
              </div>
              {item?.graphCode && (
                  <div className={styles?.cardItemNode}>
                    <div className={styles?.nodeLabel}>接口类型：</div>
                    <div className={styles?.nodeContent}>{item?.graphCode}</div>
                  </div>
                )}
              {/* admin权限 */}
              <Access accessible={canEdit}>
                {item?.graphHost && (
                  <div className={styles?.cardItemNode}>
                    <div className={styles?.nodeLabel}>图谱地址：</div>
                    <div className={styles?.nodeContent}>
                      <Typography.Link href={item?.graphHost} target="_blank">
                        {item?.graphHost}
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
        <Access accessible={canEdit}>
          <Space className={classNames(styles.cardItemManage)}>
            {/* 修改图谱空间 */}
            <GraphWorkspaceSave
              graph={item?.graph}
              workspace={item?.name}
              action={GraphWorkSpaceActionEnum.EDIT}
              refresh={refresh}
            />

            {/* pop提示 */}
            <Popconfirm
              disabled={loading}
              title={`确定要删除该图谱空间吗？`}
              onConfirm={async () => {
                if (!item?.graph) return false;
                if (!item?.name) return false;
                const result = await handleDelete({
                  graph: item?.graph,
                  workspace: item?.name,
                }); // 刷新图谱空间列表
                if (result) {
                  refresh();
                }
              }}
            >
              <Button
                title="删除图谱空间"
                type={'text'}
                danger
                icon={<CloseOutlined />}
              />
            </Popconfirm>
          </Space>
        </Access>
        <Space className={classNames(styles.cardItemActions)}>
          <Link
            title={'图谱对话'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_GRAPH_CHAT, {
                graph: item?.graph,
                workspace: encodeURIComponent(item?.name),
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
            title={'文档列表'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_DOCUMENT, {
                graph: item?.graph,
                workspace: encodeURIComponent(item?.name),
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
              icon={<FolderOpenOutlined />}
            />
          </Link>
          <Link
            title={'图谱表格'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_GRAPH_TABLE, {
                graph: item?.graph,
                workspace: encodeURIComponent(item?.name),
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
              icon={<TableOutlined />}
            />
          </Link>
          <Link
            title={'图谱展示'}
            to={{
              pathname: generatePath(ROUTE_MAP.AI_GRAPH_SHOW, {
                graph: item?.graph,
                workspace: encodeURIComponent(item?.name),
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
              icon={<NodeIndexOutlined />}
            />
          </Link>
        </Space>
      </List.Item>
    </Spin>
  );
};

export default GraphCard;
