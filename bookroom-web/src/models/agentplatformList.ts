import { useState } from 'react';

const AgentPlatformList = () => {
  const [platformList, setPlatformList] = useState<API.PlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'agentplatformList',
    platformList,
    getPlatformInfo:(platform: string)=>{
      return platformList?.find((item) => item.id === platform || item.name === platform);
    },
    setPlatformList: (dataList: API.PlatformInfo[] | null) => {
      setPlatformList(dataList);
    },
    resetPlatformList: () => {
      setPlatformList(null);
    },
  };
};

export default AgentPlatformList;
