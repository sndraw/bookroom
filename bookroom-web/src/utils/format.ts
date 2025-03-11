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
