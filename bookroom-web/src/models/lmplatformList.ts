import { useState } from 'react';

const LmPlatformList = () => {
  const [platformList, setPlatformList] = useState<API.PlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'lmplatformList',
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
    setPlatformList: (dataList: API.PlatformInfo[] | null) => {
      setPlatformList(dataList);
    },
    resetPlatformList: () => {
      setPlatformList(null);
    },
  };
};

export default LmPlatformList;
