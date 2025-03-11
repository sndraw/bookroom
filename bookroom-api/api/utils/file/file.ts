
const fs = require("fs");
const mimes = require("./mimes");
const path = require("path");

/**
 * 验证路径是否安全，避免路径遍历攻击。
 * @param {string} reqPath 请求的路径
 * @returns {boolean} 路径是否安全
 */
function isPathSafe(reqPath: string) {
    return reqPath.startsWith(process.cwd() + path.sep);
}
/**
 * 判断文件类型
 * @param {string} fileName 文件名
 * @returns {string|undefined} 文件的MIME类型
 */
function getFileMimeType(fileName: any) {
    const extName = path.extname(fileName).toLowerCase();
    return mimes[extName.slice(1)] || "undefined";
}

/**
 * 读取文件方法
 * @param  {string} 文件本地的绝对路径
 * @return {string|binary}
 */

async function file(filePath: any) {
    if (!isPathSafe(filePath)) {
        throw new Error("Unsafe path accessed.");
    }
    const fileMimeType = getFileMimeType(filePath);
    if (!fileMimeType) {
        return null;
    }
    const content = fs.readFileSync(filePath, "binary");
    return content;
}

export default file;