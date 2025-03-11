import { OperationObjType, OperationTypeEnum } from '@/types';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

// 添加props类型
interface ContexmenuProps {
  graph: string;
  workspace: string;
  operation?: OperationObjType | null;
  onClose?: () => void;
  refresh?: () => void;
}

const ContexmenuPanel: React.FC<ContexmenuProps> = (props) => {
  const { graph, workspace, operation, onClose, refresh } = props;
  // 状态管理
  const [visible, setVisible] = useState(false);
  // 打开抽屉
  useEffect(() => {
    if (operation?.type !== OperationTypeEnum.contextmenu) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [operation]);
  return (
    <>
      {visible && (
        <div className={styles.contexmenu} style={operation?.style}>
          <div className={styles.contexmenuItem}>
            <div className={styles.contexmenuItemTitle}>节点操作</div>
            <div className={styles.contexmenuItemContent}>
              <div
                className={styles.contexmenuItemContentItem}
                onClick={() => {
                  setVisible(false);
                  onClose?.();
                }}
              >
                123
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContexmenuPanel;
