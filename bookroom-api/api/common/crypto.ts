/**
 * 加密和解密
 **/

import CryptoJS from "crypto-js";
import { secretKey } from "../config/crypto.conf"; // 密钥
// 加密
export const encrypt = (data: string | CryptoJS.lib.WordArray, salt = null) => {
  // 加密向量
  const iv =
    salt || CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
  // 加密结果
  const ciphertext = CryptoJS.AES.encrypt(
    data,
    CryptoJS.enc.Hex.parse(secretKey),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return {
    iv: iv,
    content: ciphertext.toString(),
  };
};

// 解密
export const decrypt = (ciphertext: string | CryptoJS.lib.CipherParams, iv: string) => {
  const decrypted = CryptoJS.AES.decrypt(
    ciphertext,
    CryptoJS.enc.Hex.parse(secretKey),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export default {
  encrypt,
  decrypt,
};
