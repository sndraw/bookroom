import classNames from 'classnames';
import ContxtmenuPanel from './ContextmenuPanel';
import GraphPanel2D from './GraphPanel2D';
import GraphPanel3D from './GraphPanel3D';
import styles from './index.less';
import LinkPanel from './LinkPanel';
import NodePanel from './NodePanel';
import LinkAdd from './LinkPanel/LinkAdd';
import NodeAdd from './NodePanel/NodeAdd';

type GraphMapPropsType = {
  // 2d或者3d
  displayMode?: '2d' | '3d';
  // 当前graph
  graph: string;
  // 当前workspace
  workspace: string;
  // 当前graph数据
  graphData?: API.AIGraphData;
  // 刷新
  refresh: () => void;
  // 样式
  className?: string;
};
const GraphMap: React.FC<GraphMapPropsType> = (props: GraphMapPropsType) => {
  const {
    displayMode = '2d',
    graph,
    workspace,
    graphData,
    refresh,
    className,
  } = props;
  const GraphPanel = displayMode === '2d' ? GraphPanel2D : GraphPanel3D;

  if (!graphData) {
    return <></>;
  }
  return (
    <>
      <GraphPanel
        graph={graph}
        workspace={workspace}
        graphData={graphData}
        refresh={refresh}
        className={classNames(styles.container, className)}
      />
      <ContxtmenuPanel graph={graph} workspace={workspace} refresh={refresh} />
      <LinkPanel graph={graph} workspace={workspace} refresh={refresh} />
      <NodePanel graph={graph} graphData={graphData} workspace={workspace} refresh={refresh} />
      {/* 添加节点 */}
      <LinkAdd graph={graph} graphData={graphData} workspace={workspace} refresh={refresh} />
      <NodeAdd graph={graph} workspace={workspace} refresh={refresh} />
    </>
  );
};

export default GraphMap;
