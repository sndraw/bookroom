import { useState } from 'react';

const AgentPlatformList = () => {
  const [platformList, setPlatformList] = useState<API.PlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'agentplatformList',
    platformList,
    getPlatformName: (platform: string) => {
      return platformList?.find((item) => item.id === platform || item.name === platform)?.name;
    },
    getPlatformCode: (platform: string) => {
      return platformList?.find((item) => item.id === platform || item.name === platform)?.code;
    },
    getPlatformInfo: (platform: string) => {
      return platformList?.find((item) => item.id === platform || item.name === platform);
    },
    getPlatformOptions: () => {
      if (platformList) {
        return platformList.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      }
      return [];
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
