const path = require("path");
const fs = require("fs");
const mimes = require("./mimes");
// const RouteMap = require("./../../routers/RouteMap").default;
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
    return mimes[extName.slice(1)] || undefined;
}

/**
 * 遍历读取目录内容（子目录，文件名）
 * @param  {string} urlPath 当前请求的上下文中的url，即ctx.path
 * @param  {string} fullPath 请求资源的完整文件夹路径
 * @param  {string} reqPath 请求资源的相对地址
 * @return {array} 目录及文件列表
 */

async function walk(fullPath: any, reqPath: any) {
    if (!isPathSafe(fullPath)) {
        throw new Error("Unsafe path accessed.");
    }
    const files = await fs.promises.readdir(fullPath);
    const walkList = [];
    for (let i = 0, len = files.length; i < len; i++) {
        const fileName = files[i];
        const filePath = path.join(fullPath, fileName);
        const fileReqPath = path.join(reqPath, fileName).replaceAll(path.sep, "/",);
        const stat = await fs.promises.stat(filePath);
        const isDir = stat.isDirectory();
        const fileItem = {
            fileName,
            reqPath: fileReqPath,
            parentReqPath: reqPath,
            isDir
        };
        // 如果类型是文件
        if (!isDir) {
            // fileItem.previewUrl = `${RouteMap?.IMAGE_PREVIEW}?filePath=${fileReqPath}`;
            // fileItem.downloadUrl = `${RouteMap?.IMAGE_DOWNLOAD}?filePath=${fileReqPath}`;
            const fileMimeType = getFileMimeType(fileName);

            if (!fileMimeType) {
                continue;
            }
        }
        walkList.push(fileItem);
    }
    walkList.sort((a, b) => {
        if (a.isDir && !b.isDir) {
            return -1;
        } else if (!a.isDir && b.isDir) {
            return 1;
        }
        return 0;
    });
    const parentReqPath = path.dirname(reqPath);
    const result = {
        reqPath,
        parentReqPath: parentReqPath === reqPath ? "" : parentReqPath,
        list: [...walkList]
    };
    return result;
}

export default walk;