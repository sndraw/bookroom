/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { postFetch } from '@/common/fetchRequest';
import { LLM_TYPE_MAP } from '@/common/llm';
import { PLATFORM_TYPE_MAP } from '@/common/platform';
import { request } from '@umijs/max';

/** GET /platform/actived  */
export async function queryAILmPlatformList(query?: { code?: string }, options?: { [key: string]: any }) {
  const params = {
    ...(query || {}),
    type: PLATFORM_TYPE_MAP?.model.value,
  };
  return request<API.Result_PlatformInfoList_>(
    '/platform/actived',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}
/** GET /ai/lm/platform/:platform */
export async function queryAILmList(
  params: {
    platform: string;
    /** current */
    current?: number;
    /** pageSize */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const { platform, ...restParams } = params;
  return request<API.Result_PageInfo_AILmInfo__>(
    `/ai/lm/platform/${platform}`,
    {
      method: 'GET',
      params: {
        ...restParams,
      },
      ...(options || {}),
    },
  );
}


/** GET /ai/lm/platform/:platform/model/:model */
export async function getAILmInfo(
  params: {
    platform: string;
    model: string;
  },
  options?: { [key: string]: any },
) {
  const { platform, model } = params;
  return request<API.Result_AILmInfo_>(
    `/ai/lm/platform/${platform}/model/${model}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}


/** POST /ai/lm/platform/:platform  */
export async function addAILm(
  params: {
    platform: string;
  },
  body: API.AILmInfoVO,
  options?: { [key: string]: any },
) {
  const { platform } = params;
  const record = {
    ...(body || {}),
  };
  return request<API.Result_AILmInfo_>(`/ai/lm/platform/${platform}`, {
    method: 'POST',
    data: { ...record },
    ...(options || {}),
  });
}


/** POST /ai/lm/platform/:platform/pull  */
export async function pullAILm(
  params: {
    platform: string;
    is_stream?: boolean;
  },
  body: API.AILmInfoVO,
  options?: { [key: string]: any },
) {
  const { platform, is_stream = true } = params;
  return postFetch({
    url: `/ai/lm/platform/${platform}/pull`,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}

/** PUT /ai/lm/platform/:platform/model/:model  */
export async function updateAILm(
  params: {
    platform: string;
    model: string;
  },
  body: API.AILmInfo,
  options?: { [key: string]: any },
) {
  const { platform, model } = params;
  return request<API.Result_AILmInfo_>(
    `/ai/lm/platform/${platform}/model/${model}`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}
/** PUT /ai/lm/platform/:platform/model/:model/status */
export async function updateAILmStatus(
  params: {
    platform: string;
    model: string;
  },
  body: { status: number | string },
  options?: { [key: string]: any },
) {
  const { platform, model } = params;
  return request<API.Result_string_>(
    `/ai/lm/platform/${platform}/model/${model}/status`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}
/** PUT /ai/lm/platform/:platform/model/:model/run */
export async function runAILm(
  params: {
    platform: string;
    model: string;
  },
  body: { status: number | string },
  options?: { [key: string]: any },
) {
  const { platform, model } = params;
  return request<API.Result_string_>(
    `/ai/lm/platform/${platform}/model/${model}/run`,
    {
      method: 'PUT',
      data: body,
      ...(options || {}),
    },
  );
}

/** DELETE /ai/lm/platform/:platform/model/:model */
export async function deleteAILm(
  params: {
    platform: string;
    model: string;
  },
  options?: { [key: string]: any },
) {
  const { platform, model } = params;
  return request<API.Result_string_>(
    `/ai/lm/platform/${platform}/model/${model}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}

/** POST /ai/lm/platform/:platform/model/:model/chat */
export async function AILmChat(
  params: {
    platformHost?: string;
    platform?: string;
    model?: string;
    is_stream?: boolean;
  },
  body: {
    model?: string;
    format?: string;
    prompt?: string;
    messages?: any[];
    temperature?: number;
    top_k?: number;
    top_p?: number;
    max_tokens?: number;
    repeat_penalty?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    limitSeconds?: number; // 设置最大时间限制
  },
  options?: { [key: string]: any },
) {
  const { platformHost, platform, model, is_stream = true } = params;
  let url = `/ai/lm/platform/${platform}/model/${model}/chat`;
  if (platformHost) {
    url = `${platformHost}/api/chat`;
  }

  return postFetch({
    url: url,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}

/** POST /ai/lm/platform/:platform/model/:model/generate  */
export async function AILmGenerate(
  params: {
    platformHost?: string;
    platform?: string;
    model?: string;
    is_stream?: boolean;
  },
  body: {
    model?: string;
    format?: string;
    prompt: string;
    images: string[];
    temperature?: number;
    top_k?: number;
    top_p?: number;
    max_tokens?: number;
    repeat_penalty?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    limitSeconds?: number; // 设置最大时间限制
  },
  options?: { [key: string]: any },
) {
  const { platformHost, platform, model, is_stream = true } = params;
  let url = `/ai/lm/platform/${platform}/model/${model}/generate`;
  if (platformHost) {
    url = `${platformHost}/api/generate`;
  }

  return postFetch({
    url: url,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}

/** POST /ai/lm/platform/:platform/model/:model/image  */
export async function AILmImage(
  params: {
    platformHost?: string;
    platform?: string;
    model?: string;
    is_stream?: boolean;
  },
  body: {
    model?: string;
    prompt: string;
    quality?: string;
    response_format?: string;
    style?: string;
    size?: string;
    n?: number;
  },
  options?: { [key: string]: any },
) {
  const { platformHost, platform, model, is_stream = true } = params;
  let url = `/ai/lm/platform/${platform}/model/${model}/image`;
  if (platformHost) {
    url = `${platformHost}/api/image`;
  }

  return postFetch({
    url: url,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}

/** POST /ai/lm/platform/:platform/model/:model/embed  */
export async function AILmEmbed(
  params: {
    platformHost?: string;
    platform?: string;
    model?: string;
    is_stream?: boolean;
  },
  body: {
    model?: string;
    input?: Array<string>;
    truncate?: boolean; // 文本截断
    dimensions?: number; // 向量维度
    encoding_format?: string; // 编码格式
  },
  options?: { [key: string]: any },
) {
  const { platformHost, platform, model, is_stream = false } = params;
  let url = `/ai/lm/platform/${platform}/model/${model}/embed`;
  if (platformHost) {
    url = `${platformHost}/api/embed`;
  }

  return postFetch({
    url: url,
    body: body,
    options: options,
    skipErrorHandler: true,
    is_stream: is_stream,
  });
}

// 获取模型分类选项集合
export function getAILmTypeList(type?: string) {
  if (type) {
    return (LLM_TYPE_MAP?.[type] || null) as any;
  } else {
    return Object.values(LLM_TYPE_MAP).map(item => ({
      label: item.text,
      value: item.value,
    }))
  }
}

// 获取模型分类名称集合
export function getAILmTypeNameList(type: string[] | string) {
  let typeList: any[] = []
  // 如果是字符串
  if (typeof type === 'string') {
    typeList = type.split(",")
  }
  // 如果是数组
  if (Array.isArray(type)) {
    typeList = [...type]
  }
  // 筛选出有效的类型列表
  if (typeList.length > 0) {
    return typeList.map(item => LLM_TYPE_MAP?.[item]?.text || item)
  }
  return []
}
