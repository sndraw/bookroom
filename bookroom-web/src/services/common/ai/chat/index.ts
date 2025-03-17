/* eslint-disable */

import { request } from '@umijs/max';

/** GET /ai/chat */
export async function queryAIChatList(
  params: {
    query_mode?: 'list' | 'search';
    /** current */
    current?: number;
    /** pageSize */
    pageSize?: number;
    /** platform */
    platform?: string;
    /** model */
    model?: string;
    /** type */
    type?: number; // 类型
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

// 添加或更新对话记录
/** POST /ai/chat */
export async function saveAIChat(
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
    chat_id: string;
  },
  options?: { [key: string]: any },
) {
  const { chat_id } = params;
  return request<API.Result_AIChatInfo_>(`/ai/chat/${chat_id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** PUT /ai/chat/:chat_id  */
export async function updateAIChat(
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
