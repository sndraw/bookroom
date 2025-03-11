import { useState } from 'react';

const GrpahInfoList = () => {
  const [platformList, setPlatformList] = useState<API.AIPlatformInfo[] | null>(
    null,
  );

  return {
    namespace: 'lmplatformList',
    platformList,
    setPlatformList: (platformList: API.AIPlatformInfo[] | null) => {
      setPlatformList(platformList);
    },
    resetPlatformList: () => {
      setPlatformList(null);
    },
  };
};

export default GrpahInfoList;
