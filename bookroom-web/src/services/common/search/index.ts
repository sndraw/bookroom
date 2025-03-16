// 该文件由 OneAPI 自动生成，请勿手动修改！
import { PLATFORM_TYPE_MAP } from '@/common/platform';
import { request } from '@umijs/max';

/** GET /platform/actived  */
export async function querySearchEngineList(options?: { [key: string]: any }) {
  const params = {
    type: PLATFORM_TYPE_MAP?.search.value,
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