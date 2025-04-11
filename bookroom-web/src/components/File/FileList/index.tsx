import { ProList } from '@ant-design/pro-components';
import { Space, Breadcrumb, Divider, Input } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import FileCard, { getFileName } from '@/components/File/FileCard';
import { useNavigate } from '@umijs/max';
import ROUTE_MAP from '@/routers/routeMap';
import useHeaderHeight from '@/hooks/useHeaderHeight';
import classNames from 'classnames';
import styles from './index.less';
import { AppstoreOutlined  } from '@ant-design/icons';

type FileListPropsType = {
    dataList: any;
    req_path?: string;
    prefix?: string;
    loading: any;
    refresh: () => void;
    className?: string;
    children?: React.ReactNode;
};

const FileList: React.FC<FileListPropsType> = (props) => {
    const { dataList, loading, req_path = "", prefix = "", refresh, className } = props;
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState<string>('' as string);
    const filterData = useMemo(() => {
        const newDataList = [
            ...(dataList || [])
        ]
        // 排序，先按照类型排序，然后按时间倒序
        newDataList.sort((a: any, b: any) => {
            if (a.isDir !== b.isDir) {
                return a.isDir ? -1 : 1; // 目录在前
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // 按时间倒序
        })

        if (!searchText) return newDataList;
        return newDataList?.filter((item: any) => {
            const fileName = getFileName(item);
            let flag = true;
            if (searchText) {
                flag = flag && fileName.includes(searchText)
            }
            return flag
        });
    }, [dataList, searchText]);

    const getNavItems = () => {
        const navItems: any = [];
        // 当前目录为根目录
        if (req_path === "/") {
            navItems.push({
                title: <AppstoreOutlined title="根目录"/>,
            });
        }
        // 当前目录为非根目录
        if (req_path !== "/") {
            const navArr = req_path.split("/");
            navItems.unshift({
                title: <AppstoreOutlined title="根目录"/>,
                className: styles?.navBarItem,
                onClick: (e: MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigate(ROUTE_MAP.FILE, {
                        state: {
                            req_path: "/",
                        }
                    })
                }
            });

            navArr.forEach((item: string, index: number) => {
                if (!item) {
                    return;
                }
                const urlPath = navArr.slice(0, index + 1).join("/");
                const isLeaf = index + 1 === navArr.length || (index + 2 === navArr.length && !navArr[index + 2]);
                const navObj = {
                    title: item,
                    className: isLeaf ? "" : styles?.navBarItem,
                    onClick: (e: MouseEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isLeaf) {
                            return;
                        }
                        navigate(ROUTE_MAP.FILE, {
                            state: {
                                req_path: urlPath,
                                prefix: prefix
                            }
                        })
                    }
                }
                navItems.push(navObj)
            })
        }
        return navItems;
    }
    const headerHeight = useHeaderHeight();

    // 计算样式
    const containerStyle = useCallback(() => {
        return {
            height: `calc(100vh - ${headerHeight + 80}px)`,
        };
    }, [headerHeight]);


    return (
        <div className={classNames(styles.container, className)} style={containerStyle()}>
            <Space size={16} wrap className={styles.header}>
                <Space size={0} wrap className={styles.headerTitle}>
                    <span>文件管理</span>
                </Space>
                <Divider type="vertical" />
                {/* 筛选文件管理 */}
                <Input.Search
                    allowClear
                    placeholder={'搜索文件'}
                    defaultValue={searchText}
                    onSearch={(value) => {
                        setSearchText(value);
                    }}
                />
                <Breadcrumb className={styles.headerBreadcrumb} separator="/"
                    items={getNavItems()} />
            </Space>
            <ProList<API.FileInfo>
                ghost={false}
                className={styles.cardList}
                rowSelection={{}}
                itemCardProps={{
                    ghost: false
                }}
                loading={loading}
                grid={{
                    gutter: [50, 25],
                    column: 4,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 4,
                }}
                metas={{
                    title: {},
                    subTitle: {},
                    type: {},
                    avatar: {},
                    content: {},
                    actions: {}
                }}
                dataSource={filterData || []}
                renderItem={(item: API.FileInfo) => {
                    const filePath = item?.name || "";
                    return <div className={styles.listItem}>
                        <FileCard item={item} refresh={refresh} redirect={() => {
                            navigate(ROUTE_MAP.FILE, {
                                state: {
                                    req_path: filePath,
                                    prefix: prefix
                                }
                            })
                        }} />
                    </div>
                }}
                pagination={{
                    style: {
                        position: 'fixed',
                        bottom: '10px',
                        right: '30px',
                    },
                    size: 'small',
                    pageSize: 12,
                    showSizeChanger: true,
                    total: filterData?.length,
                }}
            />
        </div>
    );
};

export default FileList;
