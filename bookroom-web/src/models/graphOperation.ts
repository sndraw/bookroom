import { OperationObjType } from '@/types';
import { useState } from 'react';

const GraphOperation = () => {
  const [operation, setOperation] = useState<OperationObjType | null>(null);

  return {
    namespace: 'graphOperation',
    operation,
    setOperation: (operation: OperationObjType | null) => {
      setOperation(operation);
    },
    resetOperation: () => {
      setOperation(null);
    },
  };
};

export default GraphOperation;
