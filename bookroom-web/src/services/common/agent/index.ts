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
/** GET /agent/platform/:platform */
export async function queryAgentList(
  params: {
    platform: string;
  },
  options?: { [key: string]: any }
) {
  const { platform } = params;
  return request<API.Result_PageInfo_AgentInfo__>(
    `/agent/platform/${platform}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** GET /agent/platform/:platform/data/:agent  */
export async function getAgentInfo(
  params: {
    platform: string;
    agent: string;
  },
  options?: { [key: string]: any },
) {
  const { platform, agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/platform/${platform}/data/${agent}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}
/** POST /agent/platform/:platform  */
export async function addAgent(
  params: {
    platform: string;
  },
  body: API.AgentInfoVO,
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/platform/${platform}`,
    {
      method: 'POST',
      data: body,
      ...(options || {}),
    },
  );
}
/** PUT /agent/platform/:platform/data/:agent  */
export async function updateAgent(
  params: {
    platform: string;
    agent: string;
  },
  body: API.AgentInfoVO,
  options?: { [key: string]: any },
) {
  const { platform, agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/platform/${platform}/data/${agent}`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}

/** PUT /agent/platform/:platform/data/:agent/status  */
export async function updateAgentStatus(
  params: {
    platform: string;
    agent: string;
  },
  body: { status: number | string },
  options?: { [key: string]: any },
) {
  const { platform, agent } = params;
  return request<API.Result_AgentInfo_>(
    `/agent/platform/${platform}/data/${agent}/status`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}
/** DELETE /agent/platform/:platform/data/:agent  */
export async function deleteAgent(
  params: {
    platform: string;
    agent: string;
  },
  options?: { [key: string]: any },
) {
  const { platform, agent } = params;
  return request<API.Result_string_>(`/agent/platform/${platform}/data/${agent}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
/** POST /agent/platform/:platform/chat/:agent  */
export async function agentChat(
  params: {
    platformHost?: string;
    platform: string;
    agent?: string;
    is_stream?: boolean;
  },
  body: {
    query: string;
  },
  options?: { [key: string]: any },
) {
  const { platformHost, platform, agent, is_stream = true } = params;
  let url = `/agent/platform/${platform}/chat/${agent}`;
  if (platformHost) {
    url = `/${platformHost}/query`;
  }
  return postFetch({
    url: url,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}
