import { STATUS_MAP } from '@/constants/DataMap';

// 示例方法，没有实际意义
export function trim(str: string) {
  return str.trim();
}

// 转换数字为状态值
export function statusToBoolean(num: number | string | undefined): boolean {
  const value = Number(num);
  if (value > 0) {
    return true;
  }
  return false;
}

// 转换状态值为数字
export function statusToNumber(status: boolean | string | undefined): number {
  const value = Number(status);
  if (value > 0) {
    return STATUS_MAP?.ENABLE.value;
  }
  return STATUS_MAP?.DISABLE.value;
}

// 状态值取反
export function reverseStatus(
  status: boolean | string | undefined | number,
): number {
  // 如果status是数字类型，直接返回相反数
  if (typeof status === 'number') {
    return -status;
  }

  // 如果是布尔或字符串类型，先转换为数字再取反
  if (typeof status === 'string' || typeof status === 'boolean') {
    const value = Number(status);
    if (value > 0) {
      return STATUS_MAP?.ENABLE.value;
    }
    return STATUS_MAP?.DISABLE.value;
  }
  return STATUS_MAP?.DISABLE.value;
}



export function isSseFormat(data: string) {
  const lines = data.split('\n');
  for (let line of lines) {
    if (!line.trim()) { // 忽略空行
      continue;
    }

    const parts = line.split(': ');

    if (parts.length !== 2) {
      return false;
    }
    const [field, value] = parts;
    // 检查字段是否为data, event, id, retry其中之一
    if (['data', 'event', 'id', 'retry'].includes(field)) {
      return true;
    }
  }
  return false;
}


export function formatSseData(sseData: any): any {
  let sseBuffer = sseData;
  let formattedStr=""; 

  let messageEndIndex;
  while ((messageEndIndex = sseBuffer.indexOf('\n\n')) !== -1) {

    const messageBlock = sseBuffer.substring(0, messageEndIndex);

    sseBuffer = sseBuffer.substring(messageEndIndex + 2);
    let eventType = 'message';
    let dataContent = '';
    const lines = messageBlock.split('\n');

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        dataContent += line.substring(5).trim() || "\n\n";
      }
    }
    try {
      const parsedData = JSON.parse(dataContent);
      if (parsedData && typeof parsedData.content === 'string') {
        formattedStr += parsedData.content;
      }
    } catch (e) {
      formattedStr += dataContent;
    }
  }

  return formattedStr
}