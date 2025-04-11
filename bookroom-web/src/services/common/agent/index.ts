import { postFetch } from "@/common/fetchRequest";
import { PLATFORM_TYPE_MAP } from "@/common/platform";
import { request } from "@umijs/max";

/** GET /platform/actived */
export async function queryAgentPlatformList(options?: { [key: string]: any }) {
  const params = {
    type: PLATFORM_TYPE_MAP?.agent.value,
  };
  return request<API.Result_PlatformInfoList_>(
    '/platform/actived',
    {
      method: 'GET',
      params: {
        ...(params || {}),
      },
      ...(options || {}),
    },
  );
}
/** GET /agent */
export async function queryAgentList(
  params?: any,
  options?: { [key: string]: any }
) {
  return request<API.Result_PageInfo_AgentInfo__>(
    `/agent`,
    {
      method: 'GET',
      params: {
        ...(params || {}),
      },
      ...(options || {}),
    },
  );
}

/** GET /agent/:agent  */
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
/** POST /agent  */
export async function addAgent(
  body: API.AgentInfoVO,
  options?: { [key: string]: any },
) {
  return request<API.Result_AgentInfo_>(
    `/agent`,
    {
      method: 'POST',
      data: body,
      ...(options || {}),
    },
  );
}
/** PUT /agent/:agent  */
export async function updateAgent(
  params: {
    agent: string;
  },
  body: API.AgentInfoVO,
  options?: { [key: string]: any },
) {
  const { agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/${agent}`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}

/** PUT /agent/:agent/status  */
export async function updateAgentStatus(
  params: {
    agent: string;
  },
  body: { status: number | string },
  options?: { [key: string]: any },
) {
  const { agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/${agent}/status`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}
/** DELETE /agent/:agent  */
export async function deleteAgent(
  params: {
    agent: string;
  },
  options?: { [key: string]: any },
) {
  const { agent } = params;
  return request<API.Result_string_>(`/agent/${agent}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
/** POST /agent/chat/:agent  */
export async function agentChat(
  params: {
    agent?: string;
    is_stream?: boolean;
  },
  body: {
    query?: any;
  },
  options?: { [key: string]: any },
) {
  const { agent, is_stream = true } = params;
  return postFetch({
    url: `/agent/${agent}/chat`,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}
