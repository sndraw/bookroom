import { Divider, Select, Space } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { useRequest } from '@umijs/max';
import { useEffect } from 'react';
import { queryAgentPlatformList } from '@/services/common/agent';

type AgentSDKSelectPropsType = {
    title?: string;
    value?: string;
    onChange: (value:string) => void;
    // 样式
    className?: string;
};
const AgentSDKSelect: React.FC<AgentSDKSelectPropsType> = (props) => {
    const { title, value, onChange, className } = props;
    // 知识图谱列表-请求
    const { data, loading, run } = useRequest(
        () => {
            return queryAgentPlatformList();
        },
        {
            manual: true,
        },
    );
    useEffect(() => {
        run();
    }, [])

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
                value={value}
                placeholder="请选择智能接口"
                showSearch
                allowClear
                loading={loading}
                disabled={loading}
                options={(data as any)?.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                }))}
                onChange={(value) => {
                    onChange(value);
                }}
            />
        </Space>
    );
};

export default AgentSDKSelect;
