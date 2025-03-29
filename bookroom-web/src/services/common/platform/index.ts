/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { AGENT_API_MAP } from '@/common/agent';
import { AI_GRAPH_PLATFORM_MAP, AI_LM_PLATFORM_MAP } from '@/common/ai';
import { PLATFORM_TYPE_MAP } from '@/common/platform';
import { SEARCH_API_MAP } from '@/common/search';
import { VOICE_RECOGNIZE_API_MAP } from '@/common/voice';
import { request } from '@umijs/max';

/** GET /platform/actived */
export async function queryPlatformActivedList(
  params?: {
    type: string;
  },
  options?: {
    [key: string]: any;
  },
) {
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

/** GET /platform */
export async function queryPlatformList(
  params?: {
    name?: string;
    status?: number | string;
    /** current */
    current?: number;
    /** pageSize */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_PlatformInfo__>(`/platform`, {
    method: 'GET',
    params: {
      ...(params || {}),
    },
    ...(options || {}),
  });
}

/** POST /platform  */
export async function addPlatform(
  body: API.PlatformInfoVO,
  options?: { [key: string]: any },
) {
  const record = {
    ...(body || {}),
  };
  return request<API.Result_PlatformInfo_>(`/platform`, {
    method: 'POST',
    data: { ...record },
    ...(options || {}),
  });
}

/** GET /platform/:platform */
export async function getPlatformInfo(
  params: {
    platform: string;
  },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_PlatformInfo_>(
    `/platform/${platform}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** PUT /platform/:platform  */
export async function updatePlatform(
  params: {
    platform: string;
  },
  body: object,
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_PlatformInfo_>(
    `/platform/${platform}`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}

/** DELETE /platform/:platform */
export async function deletePlatform(
  params: {
    platform: string;
  },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_string_>(`/platform/${platform}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
/** PUT /platform/:id/parameters */
export async function updatePlatformParameters(
  params: {
    platform: string;
  },
  body: { parameters: object | string },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_string_>(`/platform/${platform}/parameters`, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}
/** PUT /platform/:id/status */
export async function updatePlatformStatus(
  params: {
    platform: string;
  },
  body: { status: number | string },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_string_>(`/platform/${platform}/status`, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}


// 获取配置类型选项集合
export function getPlatformTypeList(type?: string) {
  if (type) {
    return (PLATFORM_TYPE_MAP?.[type] || null) as any;
  } else {
    return Object.values(PLATFORM_TYPE_MAP).map(item => ({
      label: item.text,
      value: item.value,
    }))
  }
}

// 获取接口类型选项集合
export function getPlatformCodeList(
  params?: {
    type?: string;
    code?: string;
  }
) {
  const dataList: Array<{
    label: string;
    value: string;
    type: string;
  }> = []
  Object.entries(AI_LM_PLATFORM_MAP).forEach(
    (item) => {
      dataList.push({
        label: item[1]?.text,
        value: item[1]?.value,
        type: PLATFORM_TYPE_MAP.model.value
      })
    },
  );
  Object.entries(AI_GRAPH_PLATFORM_MAP).forEach(
    (item) => {
      dataList.push({
        label: item[1]?.text,
        value: item[1]?.value,
        type: PLATFORM_TYPE_MAP.graph.value
      })
    },
  );
  Object.entries(AGENT_API_MAP).forEach(
    (item) => {
      dataList.push({
        label: item[1]?.text,
        value: item[1]?.value,
        type: PLATFORM_TYPE_MAP.agent.value
      })
    },
  );
  Object.entries(SEARCH_API_MAP).forEach(
    (item) => {
      dataList.push({
        label: item[1]?.text,
        value: item[1]?.value,
        type: PLATFORM_TYPE_MAP.search.value
      })
    },
  );
  Object.entries(VOICE_RECOGNIZE_API_MAP).forEach(
    (item) => {
      dataList.push({
        label: item[1]?.text,
        value: item[1]?.value,
        type: PLATFORM_TYPE_MAP.voice_recognize.value
      })
    },
  );
  if (!params) {
    return dataList;
  }

  return dataList.filter((item) => {
    let flag = true;
    if (params?.type) {
      flag = flag && item?.type === params?.type;
    }
    if (params?.code) {
      flag = flag && item?.value === params?.code;
    }
    return flag;
  });
}