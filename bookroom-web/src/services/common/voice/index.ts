import { postFetch } from "@/common/fetchRequest";
import { request } from "@umijs/max";

/** GET /voice/recognize/:id  */
export async function queryVoiceRecognizeList(
  params?: {
    /** current */
    current?: number;
    /** pageSize */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PlatformInfoList_>(
    `/voice/recognize`,
    {
      method: 'GET',
      params: {
        ...(params || {}),
      },
      ...(options || {}),
    },
  );
}

/** GET /voice/recognize/:id  */
export async function getVoiceRecognizeInfo(
  params: {
    id: string;
  },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Result_PlatformInfo_>(
    `/voice/recognize/${id}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** POST /voice/recognize/:id/task  */
export async function voiceRecognizeTask(
  params: {
    id: string;
    is_stream?: boolean;
  },
  body: {
    voiceData?: any;
  },
  options?: { [key: string]: any },
) {
  const { id, is_stream = false } = params;
  const url = `/voice/recognize/${id}/task`;
  return postFetch({
    url: url,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}
