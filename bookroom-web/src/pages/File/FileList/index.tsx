import { useEffect } from 'react';
import { queryFileList } from '@/services/common/file';
import { useRequest, useLocation, useNavigate, generatePath } from '@umijs/max';
import DefaultLayout from '@/layouts/DefaultLayout';
import FileList from '@/components/File/FileList';
import styles from './index.less';


const FileListPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location?.state as any;
    const req_path = state?.req_path || "/";
    const prefix = state?.prefix || "";

    // 文件列表-请求
    const { data, loading, run } = useRequest(() => queryFileList({ req_path }), {
        manual: true,
    });

    useEffect(() => {
        run();
    }, [req_path, prefix]);

    return (
        <DefaultLayout>
            <FileList
                className={styles.pageContainer}
                dataList={data?.list ||[] }
                req_path={req_path}
                prefix={prefix}
                loading={loading}
                refresh={run}
            />
        </DefaultLayout>
    );
};

export default FileListPage;
