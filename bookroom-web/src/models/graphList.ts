import { useState } from 'react';

const GrpahInfoList = () => {
  const [graphList, setGraphList] = useState<API.AIGraphInfo[] | null>(null);

  return {
    namespace: 'graphList',
    graphList,
    getGraphName: (graph: string) => {
      return graphList?.find((item) => item.id === graph || item.name === graph)?.name;
    },
    getGraphInfo: (graph: string) => {
      return graphList?.find((item) => item.id === graph || item.name === graph);
    },
    setGraphList: (dataList: API.AIGraphInfo[] | null) => {
      setGraphList(dataList);
    },
    resetGraphList: () => {
      setGraphList(null);
    },
  };
};

export default GrpahInfoList;
