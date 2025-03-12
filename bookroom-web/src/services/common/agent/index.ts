import { request } from "@umijs/max";

/** GET /platform */
export async function queryAgentList(options?: { [key: string]: any }) {
  return request<API.Result_AgentInfoList_>(
    '/agent',
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** GET /ai/agent/:agent  */
export async function getAgentInfo(
  params: {
    agent: string;
  },
  options?: { [key: string]: any },
) {
  const { agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/${agent}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
/** GET /ai/agent/:agent  */
export async function saveAgentConfig(
  params: {
    agent: string;
  },
  options?: { [key: string]: any },
) {
  const { agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/${agent}`,
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}
