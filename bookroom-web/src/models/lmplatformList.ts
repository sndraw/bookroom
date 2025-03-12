import { useState } from 'react';

const LmPlatformList = () => {
  const [platformList, setPlatformList] = useState<API.PlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'lmplatformList',
    platformList,
    getGraphInfo: (graph: string) => {
      return platformList?.find((item) => item.id === graph || item.name === graph);
    },
    setPlatformList: (dataList: API.PlatformInfo[] | null) => {
      setPlatformList(dataList);
    },
    resetPlatformList: () => {
      setPlatformList(null);
    },
  };
};

export default LmPlatformList;
