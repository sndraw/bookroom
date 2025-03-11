import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OperationTypeEnum } from '@/types';
import { useModel } from '@umijs/max';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import SearchPanel from '../SearchPanel';
import { formatText } from '../utils';

type GraphPanel3DPropsType = {
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

const GraphPanel3D: React.FC<GraphPanel3DPropsType> = (
  props: GraphPanel3DPropsType,
) => {
  const { graph, workspace, graphData, refresh, className } = props;
  // 显式指定 useRef 的泛型参数类型
  const graphRef = useRef<ForceGraphMethods<any> | undefined>(undefined);
  const graphPanelRef = useRef<HTMLDivElement | null>(null);
  const [inited, setInited] = useState(false);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  // 操作状态管理
  const { operation, setOperation, resetOperation } =
    useModel('graphOperation');

  const formatGraphData = useMemo(() => {
    if (!graphData) {
      return {
        nodes: [],
        links: [],
      };
    }
    const nodes: any[] = graphData?.nodes || [];
    const links: any[] = graphData?.edges || [];
    return {
      nodes: nodes,
      links: links,
    };
  }, [graphData]);
  // 图谱配置
  const graphOps = {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    nodeSize: 2,
    nodeOpacity: 0.5,
    nodeTextColor: 'rgba(255, 255, 255, 0.8)',
    nodeHoverColor: 'rgba(248, 142, 56, 1)',
    linkWidth: 0.2,
    linkArrowLength: 3,
    linkOpacity: 0.8,
    linkColor: 'rgba(255, 255, 255, 0.5)',
    linkTextColor: 'rgba(255, 255, 255, 0.8)',
    linkHoverColor: 'rgba(248, 142, 56, 1)',
    shadowColor: 'rgba(247, 207, 207, 0.5)',
    shadowBlur: 10,
  };

  // 当窗口大小变化时，调整图表尺寸
  const resizeGraph = useCallback(
    (width: number, height: number) => {
      if (graphRef.current) {
        setWidth(width);
        setHeight(height);
      }
    },
    [graphRef],
  );

  useEffect(() => {
    if (graphPanelRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          resizeGraph(width, height);
        }
      });

      resizeObserver.observe(graphPanelRef.current);
      // 清理函数，防止内存泄漏
      return () => {
        resetOperation();
        if (!graphPanelRef.current) {
          return;
        }
        resizeObserver.unobserve(graphPanelRef.current!);
      };
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (graphPanelRef?.current) {
        // 如果是第一次挂载，则执行一次缩放
        if (!inited) {
          graphRef.current?.zoomToFit(1000);
          setInited(true);
        }
        graphRef.current?.refresh();
      }
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [graphData, graphRef]);

  const nodeThreeObject = useCallback(
    (node: any) => {
      const label = formatText(node?.id);
      const sprite = new SpriteText(label);
      sprite.color = graphOps.nodeTextColor;
      sprite.textHeight = 1;
      return sprite;
    },
    [graphOps],
  );

  const linkThreeObject = useCallback(
    (link: any) => {
      const sprite = new SpriteText(formatText(link?.keywords));
      sprite.textHeight = 1;
      sprite.color = graphOps.linkTextColor;
      const textCenter = {
        x: (link.source.x + link.target.x) / 2,
        y: (link.source.y + link.target.y) / 2,
        z: (link.source.z + link.target.z) / 2,
      };
      sprite.position.set(textCenter.x, textCenter.y, textCenter.z);
      return sprite;
    },
    [graphOps],
  );

  if (!graphData) {
    return <></>;
  }

  return (
    <div ref={graphPanelRef} className={classNames(className)}>
      <SearchPanel
        onSearch={(value) => {
          const cNode = formatGraphData?.nodes?.find((node) => {
            return node.label === value || node.label?.includes(value);
          });
          if (cNode) {
            graphRef.current?.cameraPosition(
              {
                x: 0,
                y: 0,
                z: 30,
              },
              {
                x: cNode.x,
                y: cNode.y,
                z: cNode.z,
              },
              1000,
            );
          }
        }}
      />
      <ForceGraph3D
        ref={graphRef}
        graphData={formatGraphData}
        width={width}
        height={height}
        forceEngine={'d3'}
        rendererConfig={{ antialias: true }}
        backgroundColor={graphOps?.backgroundColor}
        numDimensions={3}
        dagMode={'radialin'}
        dagLevelDistance={5}
        showNavInfo={true}
        // 默认zoom
        nodeLabel={(node) => {
          const label = formatText(node?.description || node?.id);
          return label;
        }}
        nodeAutoColorBy="source_id"
        nodeResolution={32}
        // nodeColor={(node) => {
        //   return getColorFromId(node.id)
        // }}
        nodeVal={(node) => node.size}
        nodeRelSize={graphOps?.nodeSize}
        nodeOpacity={graphOps?.nodeOpacity}
        linkOpacity={graphOps?.linkOpacity}
        linkLabel={(link) => {
          return formatText(link?.description || link?.keywords);
        }}
        linkCurvature={0.1}
        linkCurveRotation={0.1}
        linkWidth={graphOps?.linkWidth}
        linkColor={graphOps?.linkColor}
        linkDirectionalArrowColor={graphOps?.linkColor}
        linkDirectionalParticleColor={graphOps?.linkColor}
        linkDirectionalArrowLength={graphOps?.linkArrowLength}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={1}
        linkDirectionalArrowResolution={32}
        linkDirectionalParticleResolution={32}
        enableNodeDrag={true}
        enableNavigationControls={true}
        enablePointerInteraction={true}
        controlType="orbit"
        onBackgroundClick={(event) => {
          console.log('Background clicked:', event);
          resetOperation();
        }}
        onBackgroundRightClick={(event) => {
          console.log('Background right clicked:', event);
          resetOperation();
        }}
        onNodeClick={(node, event) => {
          // 处理节点点击事件
          setOperation({
            type: OperationTypeEnum.edit,
            node: node,
          });
        }}
        onNodeRightClick={(node, event) => {
          // 处理节点右键点击事件，弹出节点关系添加
          setOperation({
            type: OperationTypeEnum.addLink,
            link: {
              source: node
            },
          });
        }}
        onLinkClick={(link, event) => {
          setOperation({
            type: OperationTypeEnum.edit,
            link: link,
          });
        }}
        onLinkRightClick={(link, event) => {
          setOperation({
            type: OperationTypeEnum.contextmenu,
            link: link,
          });
        }}
        nodeThreeObjectExtend={true}
        linkThreeObjectExtend={true}
        nodeThreeObject={nodeThreeObject}
        linkThreeObject={linkThreeObject}
        linkPositionUpdate={(sprite, { start, end }) => {
          const textCenter = {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
            z: (start.z + end.z) / 2,
          };
          sprite.position.set(textCenter.x, textCenter.y, textCenter.z);
        }}
      />
    </div>
  );
};

export default GraphPanel3D;
