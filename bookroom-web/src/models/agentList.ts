import { useState } from 'react';

const AgentInfoList = () => {
  const [agentList, setAgentList] = useState<API.AgentInfo[] | null>(
    null,
  );

  return {
    namespace: 'agentList',
    agentList,
    setAgentList: (agentList: API.AgentInfo[] | null) => {
      setAgentList(agentList);
    },
    resetAgentList: () => {
      setAgentList(null);
    },
  };
};

export default AgentInfoList;
