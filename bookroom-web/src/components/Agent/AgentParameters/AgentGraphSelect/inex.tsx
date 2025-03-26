import { Divider, Select, Space } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { useRequest } from '@umijs/max';
import { useEffect, useState } from 'react';
import { queryGraphList, queryGraphWorkspaceList } from '@/services/common/ai/graph';

type AgentGraphSelectPropsType = {
    title?: string;
    values?: {
        graph?: string;
        workspace?: string;
    }
    onChange: (values: {
        graph?: string;
        workspace?: string;
    }) => void;
    // 样式
    className?: string;
};
const AgentGraphSelect: React.FC<AgentGraphSelectPropsType> = (props) => {
    const { title, values, onChange, className } = props;
    const [graph, setGraph] = useState(values?.graph);
    const [workspace, setWorkspace] = useState(values?.workspace);
    // 知识图谱列表-请求
    const { data, loading, run } = useRequest(
        () => {
            return queryGraphList();
        },
        {
            manual: true,
        },
    );
    // 图片空间列表-请求
    const { data: workspaceData, loading: workspaceLoading, run: workspaceRun } = useRequest(
        () => {
            return queryGraphWorkspaceList({
                graph: graph || '',
            });
        },
        {
            manual: true,
        },
    );

    useEffect(() => {
        run();
    }, [])

    useEffect(() => {
        if (graph) {
            workspaceRun().then((resData) => {
                const list = resData?.list;
                if (list && list.length > 0) {
                    // 如果workspace存在且在列表中，则保持不变，否则设置为第一个模型
                    if (!workspace) {
                        setWorkspace(undefined)
                        return;
                    }
                    if (list.find(item => item.workspace === workspace)) {
                        setWorkspace(workspace)
                        return;
                    }
                    setWorkspace(undefined)
                }
                setWorkspace(undefined)

            }).catch(() => {
                setWorkspace(undefined);
            })
        }
    }, [graph]);

    return (
        <Space wrap size={10} direction={'vertical'} className={classNames(styles.selectContainer, className)}>
            {title &&
                <>
                    <span className={styles.title}>{title}</span>
                    <Divider type="vertical" />
                </>
            }
            <Select<string>
                className={styles?.selectElement}
                value={graph}
                placeholder="请选择知识图谱"
                showSearch
                allowClear
                loading={loading || workspaceLoading}
                disabled={loading || workspaceLoading}
                options={(data as any)?.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                }))}
                onChange={(value) => {
                    setGraph(value);
                }}
            />
            <Select<string>
                className={styles?.selectElement}
                value={workspace}
                placeholder="请选择图谱空间"
                showSearch
                allowClear
                loading={loading || workspaceLoading}
                disabled={loading || workspaceLoading || !graph}
                options={graph ? workspaceData?.list?.map((item: any) => ({
                    label: item.name,
                    value: item.name,
                })) : undefined}
                onChange={(value) => {
                    setWorkspace(value);
                    const selected = value ? {
                        graph: graph,
                        workspace: value,
                    } : {};
                    onChange(selected);
                }}
            />
        </Space>
    );
};

export default AgentGraphSelect;
