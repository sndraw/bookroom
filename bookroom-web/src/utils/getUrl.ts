/**
 * 根据目标端口转换URL。
 *
 * 该函数接受一个字符串或数字作为参数，如果参数是数字且为有限的整数，
 * 则会将当前URL的端口设置为该数字，并返回新的URL字符串。
 * 如果参数不是数字或不是有限的整数，则直接返回原始参数的字符串形式。
 * 这个函数主要用于处理需要根据不同的端口号来构造目标URL的场景。
 *
 * @param targetUrl 目标URL或端口号。
 * @returns 转换后的URL字符串。
 */

// 转换targetUrl
export const convertTargetUrl = (
  targetUrl: string | number | undefined | null,
) => {
  if (Number.isFinite(Number(targetUrl))) {
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL(currentUrl);
    newUrl.port = String(targetUrl);
    return newUrl.origin;
  }

  const newTargetUrl = (targetUrl || '').toString();
  try {
    // 尝试创建一个新的URL对象
    new URL(newTargetUrl);
    // 如果没有抛出错误，说明URL是完整的
    return newTargetUrl;
  } catch (error) {
    const origin = window.location.protocol + '//' + window.location.hostname;
    return `${origin}${newTargetUrl}`;
  }
};
