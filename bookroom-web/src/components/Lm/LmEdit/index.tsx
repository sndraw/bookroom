
import EditPanel from '@/components/FormPanel/EditPanel';
import { updateAILm } from '@/services/common/ai/lm';
import { message } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface LmEditProps {
  platform: string;
  model: string;
  data: API.AILmInfoVO;
  columns: any;
  refresh?: () => void;
  disabled?: boolean;
}

const LmEdit: React.FC<PropsWithChildren<LmEditProps>> = (props) => {
  const { platform, model, data, columns, refresh, disabled } = props;
  const [loading, setLoading] = useState<boolean>(false);
  /**
 * 修改模型
 * @param fields
 */
  const handleEdit = async (fields: API.AILmInfoVO) => {
    setLoading(true);
    try {
      // 如果parameters是字符串
      if (fields?.parameters && typeof fields?.parameters === 'string') {
        fields.parameters = JSON.parse(fields.parameters);
      }
      // 修改模型
      await updateAILm({
        platform,
        model
      }, {
        ...fields
      });
      message.success('添加成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };


  return (
    <EditPanel
      title={"修改模型"}
      data={data}
      columns={columns}
      onFinished={handleEdit}
      refresh={refresh}
      disabled={disabled || loading}
    />
  );
}
export default LmEdit;
