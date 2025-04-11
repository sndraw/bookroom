/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { request } from '@umijs/max';

/** POST /ai/graph/:graph/workspace/data/text */
export async function insertDocumentText(
  params: {
    graph: string;
    workspace: string;
  },
  body: API.AIGraphDocument_TextType,
  options?: { [key: string]: any },
) {
  const { graph, workspace } = params;

  return request<API.Result_string_>(
    `/ai/graph/${graph}/workspace/${workspace}/data/text`,
    {
      method: 'POST',
      data: body,
      ...(options || {}),
    },
  );
}

/** POST /ai/graph/:graph/workspace/data/file */
export async function insertDocumentFile(
  params: {
    graph: string;
    workspace: string;
  },
  body: any,
  options?: { [key: string]: any },
) {
  const { graph, workspace } = params;

  return request<API.Result_string_>(
    `/ai/graph/${graph}/workspace/${workspace}/data/file`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** GET /ai/graph/:graph/workspace/document */
export async function queryGraphDocumentList(
  params: {
    graph: string;
    workspace: string;
  },
  options?: { [key: string]: any },
) {
  const { graph, workspace } = params;
  return request<API.Result_AIGraphDocumentInfoList_>(
    `/ai/graph/${graph}/workspace/${workspace}/document`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** GET /ai/graph/:graph/workspace/document/:document_id */
export async function getGraphDocument(
  params: {
    graph: string;
    workspace: string;
    document_id: string;
  },
  options?: { [key: string]: any },
) {
  const { graph, workspace, document_id } = params;

  return request<API.Result_AIGraphDocumentInfo_>(
    `/ai/graph/${graph}/workspace/${workspace}/document/${document_id}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/** DELETE /ai/graph/:graph/workspace/document/:document_id */
export async function deleteGraphDocument(
  params: {
    graph: string;
    workspace: string;
    document_id: string;
  },
  options?: { [key: string]: any },
) {
  const { graph, workspace, document_id } = params;

  return request<API.Result_string_>(
    `/ai/graph/${graph}/workspace/${workspace}/document/${document_id}`,
    {
      method: 'DELETE',
      ...(options || {}),
    },
  );
}
