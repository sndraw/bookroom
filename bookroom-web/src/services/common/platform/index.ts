/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
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
  return request<API.Result_PageInfo_PlatformInfo__>(`/platform`, {
    method: 'GET',
    params: {
      ...params,
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
