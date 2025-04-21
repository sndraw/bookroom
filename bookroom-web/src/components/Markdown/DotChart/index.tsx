import Graphviz from "graphviz-react";
import styles from './index.less';
import classNames from "classnames";
import { useRef, useState } from "react";
import { Button } from "antd";

interface DotChartData {
    code: string;
    className?: string;
}

const DotChart: React.FC<{ chart: DotChartData }> = ({ chart }) => {
    const { code = "", className } = chart;
    const ref = useRef<HTMLDivElement | null>(null);

    const [isFullScreen, setIsFullScreen] = useState(false);
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
    };
    return (
        <div ref={ref} className={classNames(styles?.container, className)} >
            <Button ghost type="primary" onClick={handleToggleFullScreen}>
                {isFullScreen ? '退出全屏' : '进入全屏'}
            </Button>
            <Graphviz dot={code} options={
                {
                    width: '100%',
                    height: 'auto',
                    fit: true,
                    scale: 1.0,
                    maxScale: 2.0, // 最大缩放比例
                    minScale: 0.5, // 最小缩放比例
                }
            } />
        </div>
    );

}
export default DotChart;



export const isValidGraphDotCode = (code: string): boolean => {
    if (typeof code !== 'string') {
        return false;
    }
    // 简单的合法性检查：确保至少包含 digraph 或 graph，并且 {} 括号闭合
    if (!code.trim()) return false;

    // 检查是否以 digraph 或 graph 开头
    const hasGraphKeyword = /^(digraph|graph)\s+/.test(code);
    if (!hasGraphKeyword) return false;

    // 检查 {} 是否闭合
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (!openBraces || !closeBraces) return false;

    // 检查是否包含至少一个节点或边定义
    const hasNodeOrEdge = /->|[\w]+\s*$.*$/.test(code);
    if (!hasNodeOrEdge) return false;

    return true;
}
