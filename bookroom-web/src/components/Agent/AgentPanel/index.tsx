import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, message, Space } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import styles from './index.less';
import useHeaderHeight from '@/hooks/useHeaderHeight';

interface AgentPanelProps {
    className?: string;
    agentInfo?: API.AgentInfo;
    onTaskStart?: () => void;
    onTaskStop?: (data: string | Blob | null) => void;
    disabled?: boolean;
}

const AgentPanel: React.FC<AgentPanelProps> = (props) => {
    const { agentInfo, className, onTaskStart, onTaskStop, disabled } = props;

    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const headerHeight = useHeaderHeight();

    // 计算样式
    const containerStyle = useCallback(() => {
        return {
            height: `calc(100vh - ${headerHeight + 40}px)`,
        };
    }, [headerHeight]);

    // 开始任务
    const startTaskHandle = async () => {
        try {
            // 开始任务
            setIsRunning(true);
            // 加载中
            setLoading(true);
            onTaskStart && onTaskStart(); // 开始任务后调用回调函数
        } catch (err: any) {
            const msg = "任务启动失败，请稍后重试。";
            setIsRunning(false);
            message.error(msg);
            console.error(`${msg}: ${err}`);
        } finally {
            // 完成加载
            setLoading(false);
        }
    };

    // 停止任务
    const stopTaskHandle = () => {
        setIsRunning(false);
        onTaskStop && onTaskStop(null); // 停止任务后调用回调函数，传递null表示没有数据返回
    };

    return (
        <div
            className={classNames(styles.container, className)}
            style={containerStyle()}
        >
            <Space size={0} wrap className={styles.header}>
                <span>{agentInfo?.name}</span>
            </Space>
            <div className={styles.panelWrapper}>
                <Button
                    disabled={disabled || loading}
                    type="link"
                    size={'large'}
                    className={styles.taskBtn}
                    title={isRunning ? '停止任务' : '开始任务'}
                    onClick={isRunning ? stopTaskHandle : startTaskHandle}
                >
                    {isRunning ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                </Button>
            </div>
        </div>
    );
};

export default AgentPanel;
