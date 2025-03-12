import { useState } from 'react';

const SearchEngineList = () => {
  const [searchEngineList, setSearchEngineList] = useState<API.PlatformInfo[] | null>(
    null,
  );
  return {
    namespace: 'searchengineList',
    searchEngineList,
    getSearchEngineInfo: (searchEngine: string) => {
      return searchEngineList?.find((item) => item.id === searchEngine || item.name === searchEngine);
    },
    setSearchEngineList: (dataList: API.PlatformInfo[] | null) => {
      setSearchEngineList(dataList);
    },
    resetSearchEngineList: () => {
      setSearchEngineList(null);
    },
  };
};

export default SearchEngineList;
