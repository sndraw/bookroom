/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { request } from '@umijs/max';
import { message } from 'antd';

/** GET /file/upload */
export async function getUrlAndUploadFileApi(
  params: {
    objectId: string; // 对象ID
  },
  body: {
    file: File; // 文件对象
  },
) {
  const { objectId } = params;
  const { file } = body;
  if (!objectId) {
    message.error('对象ID不能为空');
    return;
  }
  const result = await request(`/file/upload/${objectId}`, {
    method: 'GET',
    params: {
      name: file.name,
      size: file.size,
      mimetype: file.type,
    },
    skipErrorHandler: true, // 忽略错误处理
  }).catch((error) => {
    console.error('获取上传地址失败', error);
  });
  // 获取上传地址
  const uploadUrl = result?.url;

  if (!uploadUrl) {
    message.error('获取上传地址失败');
    return;
  }
  // // 组装数据
  // const formData = new FormData();
  // formData.append('file', file, file.name);
  const uploadedResult = await fetch(uploadUrl, {
    method: 'PUT',
    body: new Blob([file], { type: file.type }), // 使用Blob对象
    headers: {
      'Content-Type': file.type,
    },
  }).catch((error) => {
    console.error('上传文件失败', error);
  });

  if (!uploadedResult?.ok) {
    message.error('上传文件失败');
    return;
  }
  return true;
}

/** POST /file/upload */
export async function uploadFileApi(
  body: FormData,
  options?: { [key: string]: any },
) {
  return request<API.Result_List_UploadedFileInfo_>('/file/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: body,
    ...(options || {}),
  });
}

/** GET /file/preview  */
export async function previewFileApi(
  params: {
    fileId: string;
  },
  options?: { [key: string]: any },
) {
  const { fileId } = params;
  return request<any>(`/file/preview/${fileId}`, {
    method: 'GET',
    skipErrorHandler: true, // 跳过错误处理
    ...(options || {}),
  });
}

/** POST /file/download  */
export async function downloadFileApi(
  params: {
    fileId: string;
  },
  options?: { [key: string]: any },
) {
  const { fileId } = params;
  return request<any>(`/file/download/${fileId}`, {
    method: 'GET',
    skipErrorHandler: true, // 跳过错误处理
    ...(options || {}),
  });
}
