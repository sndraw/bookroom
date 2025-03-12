import { useState } from 'react';

const AgentPlatformList = () => {
  const [platformList, setPlatformList] = useState<API.PlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'agentplatformList',
    platformList,
    setPlatformList: (dataList: API.PlatformInfo[] | null) => {
      setPlatformList(dataList);
    },
    resetPlatformList: () => {
      setPlatformList(null);
    },
  };
};

export default AgentPlatformList;
