import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OperationTypeEnum } from '@/types';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

import { useModel } from '@umijs/max';
import SearchPanel from '../SearchPanel';
import { formatText } from '../utils';

type GraphPanel2DPropsType = {
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

const GraphPanel2D: React.FC<GraphPanel2DPropsType> = (
  props: GraphPanel2DPropsType,
) => {
  const { graph, workspace, graphData, refresh, className } = props;

  // 操作状态管理
  const { operation, setOperation, resetOperation } =
    useModel('graphOperation');

  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  // 显式指定 useRef 的泛型参数类型
  const graphRef = useRef<ForceGraphMethods<any> | undefined>(undefined);
  const graphPanelRef = useRef<HTMLDivElement | null>(null);
  const formatGraphData = useMemo(() => {
    const nodes: any[] = graphData?.nodes || [];
    const links: any[] = graphData?.edges || [];
    nodes.forEach((node) => {
      node.group = node?.source_id;
    });
    return {
      nodes: nodes,
      links: links,
    };
  }, [graphData]);
  // 图谱配置
  const graphOps = {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    nodeSize: 5,
    nodeTextColor: 'rgba(255, 255, 255, 0.8)',
    nodeHoverColor: 'rgba(248, 142, 56, 1)',
    linkWidth: 1,
    linkArrowLength: 3,
    linkColor: 'rgba(255, 255, 255, 0.5)',
    linkTextColor: 'rgba(255, 255, 255, 0.8)',
    linkHoverColor: 'rgba(248, 142, 56, 1)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
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
    [graphRef.current],
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

  const nodeCanvasObject = useCallback(
    (node: any, ctx: any, globalScale: number) => {
      // 自定义节点标签的渲染（可选）
      ctx.font = `${Math.max(2, 12 / globalScale)}px Sans-Serif`;
      ctx.fillStyle = graphOps;
      ctx.textAlign = 'center';

      ctx.textBaseline = 'middle';
      // 节点被点击时
      if (node?.id && node?.id === operation?.node?.id) {
        // 绘制标签
        ctx.fillStyle = graphOps.nodeTextColor;
        // 阴影效果
        ctx.shadowColor = graphOps.nodeHoverColor;
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = graphOps.nodeTextColor;
        ctx.shadowColor = '';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(formatText(node?.label || node?.id), node.x, node.y);
    },
    [graphOps],
  );

  const linkCanvasObject = useCallback(
    (link: any, ctx: any, globalScale: number) => {
      const source = link.source;
      const target = link.target;

      // 计算连线的方向向量
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      // 计算单位向量
      const ux = dx / length;
      const uy = dy / length;
      // 计算新的起点和终点
      const sx = source.x + ux * graphOps.nodeSize;
      const sy = source.y + uy * graphOps.nodeSize;
      // 稍微缩短线段的长度
      const tx = target.x - ux * (graphOps.nodeSize + graphOps.linkArrowLength);
      const ty = target.y - uy * (graphOps.nodeSize + graphOps.linkArrowLength);

      // 在连线中央显示节点关系
      if (link.keywords) {
        // 假设 link 对象有一个 type 属性表示节点关系名称
        // 计算线段中点
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;

        // 设置文本样式
        ctx.font = `2px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 计算法向量（垂直于线段的方向向量）
        const nx = -uy;
        const ny = ux;

        // 定义文本与线段的距离偏移量
        const textOffset = 2; // 根据需要调整这个值

        // 计算偏移后的文本位置
        const offsetX = midX + nx * textOffset;
        const offsetY = midY + ny * textOffset;

        // 保存当前绘图状态
        ctx.save();

        // 移动到偏移后的位置
        ctx.translate(offsetX, offsetY);

        // 计算箭头角度
        let angle = Math.atan2(dy, dx);

        // 确保文本方向正确
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          angle += Math.PI;
        }
        // 旋转画布
        ctx.rotate(angle);
        // 节点被点击时
        if (link?.id && link?.id === operation?.link?.id) {
          ctx.fillStyle = graphOps?.linkHoverColor; // 文本颜色
        } else {
          ctx.fillStyle = graphOps?.linkTextColor; // 文本颜色
        }
        // 绘制文本
        const label = formatText(link?.keywords);
        // 判定label是否换行
        const lines = label.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const y = i * 3.5;
          ctx.fillText(formatText(line), 0, y);
        }
        // 恢复绘图状态
        ctx.restore();
      }
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
          graphRef.current?.zoomToFit(1000, 200, (node) => {
            return node.label === value || node.label?.includes(value);
          });
        }}
      />
      <ForceGraph2D
        ref={graphRef}
        graphData={formatGraphData}
        width={width}
        height={height}
        backgroundColor={graphOps?.backgroundColor}
        minZoom={0.1}
        maxZoom={10}
        // dagMode={'radialin'}
        dagLevelDistance={30}
        nodeLabel={(node) => {
          const label = formatText(node?.description || node?.id);
          return label;
        }}
        nodeAutoColorBy="source_id"
        // nodeColor={node => getColorFromId(node.source_id)}
        nodeVal={(node) => node.size}
        nodeRelSize={graphOps?.nodeSize}
        enableNodeDrag={true}
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
        onNodeRightClick={(node) => {
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
          // 获取envet位置
          setOperation({
            type: OperationTypeEnum.contextmenu,
            link: link,
          });
        }}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={nodeCanvasObject}
        linkLabel={(link) => {
          return formatText(link?.description || link?.keywords);
        }}
        linkWidth={graphOps?.linkWidth}
        linkColor={() => graphOps?.linkColor}
        linkDirectionalArrowColor={() => graphOps?.linkColor}
        linkDirectionalParticleColor={() => graphOps?.linkColor}
        linkDirectionalArrowLength={graphOps?.linkArrowLength}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={1}
        linkCurvature={0}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={linkCanvasObject}
      />
    </div>
  );
};

export default GraphPanel2D;
