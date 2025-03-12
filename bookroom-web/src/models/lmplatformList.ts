import { useState } from 'react';

const GrpahInfoList = () => {
  const [platformList, setPlatformList] = useState<API.PlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'lmplatformList',
    platformList,
    setPlatformList: (platformList: API.PlatformInfo[] | null) => {
      setPlatformList(platformList);
    },
    resetPlatformList: () => {
      setPlatformList(null);
    },
  };
};

export default GrpahInfoList;
