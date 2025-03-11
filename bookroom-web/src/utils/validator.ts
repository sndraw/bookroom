import emojiRegex from 'emoji-regex';
// 定义允许的文件扩展名
const allowedExtensions = /\.(png|jfif|pjpeg|jpeg|pjp|jpg|ico|svgz|svg)$/i;

// 上传图片-异步验证
export const asyncVerifyImg = (value: string) => {
  if (!value) {
    return Promise.resolve();
  }
  // 检查value是否以允许的扩展名结束/是否emoji
  if (allowedExtensions.test(value) || emojiRegex().test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(
    new Error('不支持的文件类型，请上传一个有效的图标文件'),
  );
};
// 上传图片
export const verifyImg = (value: string) => {
  if (!value) {
    return false;
  }
  // 检查value是否以允许的扩展名结束/是否emoji
  if (allowedExtensions.test(value) || emojiRegex().test(value)) {
    return true;
  }
  return false;
};
