/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { request } from '@umijs/max';

/** GET /initial */
export async function fetchInitialData(
  params?: {},
  options?: { [key: string]: any },
) {
  return request<API.Result_InitialData_>('/initial', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
