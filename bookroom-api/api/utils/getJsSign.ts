import sha1 from "sha1";
// 获取js-sdk签名
const getJsSign = (params:any = {}) => {
  const signArray: string[] = [];
  Object.keys(params).forEach((key) => {
    signArray.push(`${key.toLowerCase()}=${params[key]}`);
  });
  const signStr = signArray.join("&");
  const sign = sha1(signStr);
  return sign;
};

export default getJsSign;
