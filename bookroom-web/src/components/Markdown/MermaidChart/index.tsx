import React, { useEffect, useRef, useCallback, useState } from 'react';
import mermaid from 'mermaid';
import classNames from 'classnames';

import styles from './index.less';

interface MermaidChartData {
  code: string;
  className?: string;
}

const MermaidChart: React.FC<{ chart: MermaidChartData }> = ({ chart }) => {
  const { code, className } = chart;
  const ref = useRef<HTMLDivElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const mermaidIdRef = useRef<string>('');

  useEffect(() => {
    if (!mermaidIdRef.current) {
      mermaidIdRef.current = 'mermaid-' + Math.random().toString(36).slice(2, 11);
    }
  }, []);

  const checkSyntax = async (text: string) => {
    try {
      const result = await mermaid.parse(text);
      return true;
    } catch (error) {
      console.error('语法错误', error);
      return false;
    }
  }


  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (ref.current) {
      if (!document.fullscreenElement) {
        // 如果当前没有元素处于全屏状态，则尝试进入全屏模式
        if (ref.current.requestFullscreen) {
          ref.current.requestFullscreen();
        }
      } else {
        // 如果已经有元素处于全屏模式，则退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }

  }

  const renderChart = async (code: string) => {

    if (ref.current) {
      const isValid = await checkSyntax(code);
      if (!isValid) {
        ref.current.innerHTML = code
        return
      }
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          useMaxWidth: true,
        },
      })
      mermaid.render(mermaidIdRef.current, code, ref.current).then(({ svg, bindFunctions }) => {
        if (svg) {
          if (ref?.current) {
            ref.current.innerHTML = svg;
            bindFunctions?.(ref.current);
          }
        }
      });
    }
  };

  useEffect(() => {
    renderChart(code);
  }, [code]);

  return <div ref={ref} title="点击进入/退出全屏" style={{cursor:"pointer"}} onClick={handleToggleFullScreen} className={classNames(styles?.container, className)} />;
};

export default MermaidChart;


export const isValidGraphMermaidCode = (code: string): boolean => {
  if (typeof code !== 'string') {
    return false;
  }
  // 简单的合法性检查：确保至少包含 digraph 或 graph，并且 {} 括号闭合
  if (!code.trim()) return false;

  // 检查是否以 digraph 或 graph 开头
  const hasGraphKeyword = /^(digraph|graph)\s+/.test(code);
  if (!hasGraphKeyword) return false;

  // 检查是否包含至少一个节点或边定义
  const hasNodeOrEdge = /->|[\w]+\s*$.*$/.test(code);
  if (!hasNodeOrEdge) return false;
  return true;
}
