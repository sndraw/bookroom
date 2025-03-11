import { useState } from 'react';

const GrpahInfoList = () => {
  const [graphList, setGraphList] = useState<API.AIGraphInfo[] | null>(null);

  return {
    namespace: 'graphList',
    graphList,
    getGraphInfo: (graph: string) => {
      return graphList?.find((item) => item.id === graph || item.name === graph);
    },
    setGraphList: (graphList: API.AIGraphInfo[] | null) => {
      setGraphList(graphList);
    },
    resetGraphList: () => {
      setGraphList(null);
    },
  };
};

export default GrpahInfoList;
