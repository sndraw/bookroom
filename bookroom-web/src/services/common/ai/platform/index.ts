/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { request } from '@umijs/max';

/** GET /platform/actived */
export async function queryAIPlatformActivedList(
  params?: {
    type: string;
  },
  options?: {
    [key: string]: any;
  },
) {
  return request<API.Result_AIPlatformInfoList_>(
    '/ai/platform/actived',
    {
      method: 'GET',
      params: {
        ...(params || {}),
      },
      ...(options || {}),
    },
  );
}

/** GET /ai/platform */
export async function queryAIPlatformList(
  params: {
    name: string;
    status: number | string;
    /** current */
    current?: number;
    /** pageSize */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_AIPlatformInfo__>(`/ai/platform`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** POST /ai/platform  */
export async function addAIPlatform(
  body: API.AIPlatformInfoVO,
  options?: { [key: string]: any },
) {
  const record = {
    ...(body || {}),
  };
  return request<API.Result_AIPlatformInfo_>(`/ai/platform`, {
    method: 'POST',
    data: { ...record },
    ...(options || {}),
  });
}

/** GET /ai/platform/:platform */
export async function getAIPlatformInfo(
  params: {
    platform: string;
  },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_AIPlatformInfo_>(
    `/ai/platform/${platform}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** PUT /ai/platform/:platform  */
export async function modifyAIPlatform(
  params: {
    platform: string;
  },
  body: object,
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_AIPlatformInfo_>(
    `/ai/platform/${platform}`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}

/** DELETE /ai/platform/:platform */
export async function deleteAIPlatform(
  params: {
    platform: string;
  },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_string_>(`/ai/platform/${platform}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** PUT /ai/platform/:id/status */
export async function modifyAIPlatformStatus(
  params: {
    platform: string;
  },
  body: { status: number | string },
  options?: { [key: string]: any },
) {
  const { platform } = params;
  return request<API.Result_string_>(`/ai/platform/${platform}/status`, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}
