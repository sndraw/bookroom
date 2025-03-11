
// 遍历读取目录内容方法
const walk = require("./walk");

/**
 * 封装目录内容
 * @param  {string} urlPath 当前请求的上下文中的url，即ctx.path
 * @param  {string} filePath 请求静态资源的完整路径
 * @param  {string} reqPath 请求静态资源的相对路径
 * @return {string} 返回目录内容，封装成HTML
 */
async function dir(urlPath: string, filePath: any, reqPath: any) {
    // 遍历读取当前目录下的文件、子目录
    const walkList = await walk(urlPath, filePath, reqPath) || {};

    let html = "";
    if (!walkList?.length) {
        html = `${html}<ul><li>${encodeURIComponent("当前目录为空")}</li></ul>`;
        return html;
    }
    html = `${html}<ul>`;
    // eslint-disable-next-line no-unused-vars
    for (const [index, item] of walkList?.entries()) {
        // 转义，以便显示中文目录
        const fileName = item?.fileName;
        const publicPath = encodeURIComponent(item?.publicPath);
        const isDir = item?.isDir;
        html = `${html}<li style="list-style-type: ${isDir ? "disc" : "none"};"><a href="${urlPath === "/" ? "" : urlPath}?filePath=${publicPath}">${fileName}</a></li>`;
    }
    html = `${html}</ul>`;
    return html;
}

export default dir;