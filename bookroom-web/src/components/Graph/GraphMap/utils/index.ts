import chroma from 'chroma-js';
import { createHash } from 'crypto';

// 文字格式化
export const formatText = (
  text: string,
  ops?: {
    splitChar?: string;
    joinChar?: string;
  },
) => {
  if (!text) return '';
  const { splitChar = '<SEP>', joinChar = '\n' } = ops || {};
  const modifiedText = text
    ?.split(splitChar)
    ?.join(joinChar);
  return modifiedText;
};

// 生成随机颜色
export const getColorFromId = (id: number) => {
  // 使用 node.id 生成一个哈希值
  const hash = createHash('md5').update(id.toString()).digest('hex');
  // 将哈希值转换为 RGB 颜色
  const r = parseInt(hash.slice(0, 2), 16);
  const g = parseInt(hash.slice(2, 4), 16);
  const b = parseInt(hash.slice(4, 6), 16);
  // 创建颜色对象
  const color = chroma.rgb(r, g, b);
  // 调整颜色的亮度和饱和度，确保颜色在 50 到 150 的范围内
  const brightness = chroma(color).get('lab.l');

  // 如果亮度不在 50 到 150 范围内，调整亮度
  const adjustedBrightness = Math.max(50, Math.min(60, brightness));
  // 透明度值，范围是 0 到 1
  const alpha = 1;

  // 生成最终的颜色
  const finalColor = chroma(color)
    .set('lab.l', adjustedBrightness)
    .alpha(alpha)
    .hex();

  return finalColor;
};
// 绘制箭头
export const drawArrowhead = (
  ctx: CanvasRenderingContext2D,
  ops: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    size: number;
    color: string;
  },
) => {
  const { fromX, fromY, toX, toY, size, color } = ops;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  // 调整箭头起点位置
  const arrowStartX = toX + size * Math.cos(angle) * 0.85;
  const arrowStartY = toY + size * Math.sin(angle) * 0.85;
  ctx.beginPath();
  ctx.moveTo(arrowStartX, arrowStartY);
  ctx.lineTo(
    arrowStartX - size * Math.cos(angle - Math.PI / 6),
    arrowStartY - size * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    arrowStartX - size * Math.cos(angle + Math.PI / 6),
    arrowStartY - size * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};
