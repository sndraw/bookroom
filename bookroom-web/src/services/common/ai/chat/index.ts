/* eslint-disable */

import { request } from '@umijs/max';

/** GET /ai/chat */
export async function queryAIChatList(
  params: {
    /** current */
    current?: number;
    /** pageSize */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_AIChatInfo__>(`/ai/chat`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** POST /ai/chat */
export async function addAIChat(
  body: API.AIChatInfoVO,
  options?: { [key: string]: any },
) {
  const record = {
    ...(body || {}),
  };
  return request<API.Result_AIChatInfo_>(`/ai/chat`, {
    method: 'POST',
    data: { ...record },
    ...(options || {}),
  });
}

/** GET /ai/chat/:chat_id  */
export async function getAIChatInfo(
  params: {
    platform: string;
    model: string;
  },
  options?: { [key: string]: any },
) {
  const { platform, model } = params;
  return request<API.Result_AIChatInfo_>(`/ai/chat`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** PUT /ai/chat/:chat_id  */
export async function saveAIChat(
  params: {
    chat_id: string;
  },
  body: object,
  options?: { [key: string]: any },
) {
  const { chat_id } = params;
  return request<API.Result_AIChatInfo_>(`/ai/chat/${chat_id}`, {
    method: 'PUT',
    data: body,
    ...(options || {}),
  });
}

/** DELETE /ai/chat/:chat_id */
export async function deleteAIChat(
  params: {
    chat_id: string;
  },
  options?: { [key: string]: any },
) {
  const { chat_id } = params;
  return request<API.Result_string_>(`/ai/chat/${chat_id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
