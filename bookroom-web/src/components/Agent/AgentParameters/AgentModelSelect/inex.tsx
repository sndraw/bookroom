import { Divider, Select, Space } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { useRequest } from '@umijs/max';
import { queryAILmList, queryAILmPlatformList } from '@/services/common/ai/lm';
import { useEffect, useState } from 'react';

type AgentModelSelectPropsType = {
    title?: string;
    values?: {
        platform?: string;
        model?: string;
    }
    onChange: (values: {
        platform?: string;
        model?: string;
    }) => void;
    // 样式
    className?: string;
};
const AgentModelSelect: React.FC<AgentModelSelectPropsType> = (props) => {
    const { title, values, onChange, className } = props;
    const [platform, setPlatform] = useState(values?.platform);
    const [model, setModel] = useState(values?.model);
    // 平台列表-请求
    const { data, loading, run } = useRequest(
        () => {
            return queryAILmPlatformList();
        },
        {
            manual: true,
        },
    );
    // 模型列表-请求
    const { data: lmData, loading: lmLoading, run: lmRun } = useRequest(
        () => {
            return queryAILmList({
                platform: platform || '',
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
        if (platform) {
            lmRun().then((resData) => {
                const list = resData?.list;
                if (list && list.length > 0) {
                    // 如果model存在且在列表中，则保持不变，否则设置为第一个模型
                    if (!model) {
                        setModel(undefined)
                        return;
                    }
                    if (list.find(item => item.model === model)) {
                        setModel(model)
                        return;
                    }
                    setModel(undefined)
                }
                setModel(undefined)

            }).catch(() => {
                setModel(undefined);
            })
        }
    }, [platform]);

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
                value={platform}
                placeholder="请选择平台"
                allowClear
                showSearch
                loading={loading || lmLoading}
                disabled={loading || lmLoading}
                options={(data as any)?.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                }))}
                onChange={(value) => {
                    setPlatform(value);
                }}
            />
            <Select<string>
                className={styles?.selectElement}
                value={model}
                placeholder="请选择模型"
                showSearch
                allowClear
                loading={loading || lmLoading}
                disabled={loading || lmLoading || !platform}
                options={platform ? lmData?.list?.map((item: any) => ({
                    label: item.name,
                    value: item.model,
                })) : undefined}
                onChange={(value) => {
                    setModel(value);
                    const selected = value ? {
                        platform: platform,
                        model: value,
                    } : {};
                    onChange(selected);
                }}
            />
        </Space>
    );
};

export default AgentModelSelect;
