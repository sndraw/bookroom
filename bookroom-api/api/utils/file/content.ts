
const path = require("path");
const fs = require("fs");
// 封装读取目录内容方法
// const dir = require("./dir");
const walk = require("./walk");

// 封装读取文件内容方法
const file = require("./file");

/**
 * 获取静态资源内容
//  * @param  {string} urlPath 当前请求的上下文中的url，即ctx.path
 * @param  {string} fullStaticPath 静态资源目录在本地的绝对路径
 * @param  {string} reqPath 请求资源的相对地址
 * @return  {string} 请求获取到的本地内容
 */

async function content(fullStaticPath: any, reqPath: string) {
    // 封装请求资源的完绝对径
    const fullPath = path.join(fullStaticPath, reqPath);
    // 反转义，以便显示中文目录
    reqPath = decodeURIComponent(reqPath);
    // 判断请求路径是否为存在目录或者文件
    const exist = fs.existsSync(fullPath);
    // 返回请求内容， 默认为空
    let _content = "";
    if (!exist) {
        // 如果请求路径不存在，返回404
        _content = "404 Not Found! o(╯□╰)o！";
    } else {
        // 判断访问地址是文件夹还是文件
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // 如果为目录，则渲读取目录内容
            // _content = await dir(url, filePath, reqPath);
            _content = await walk(fullPath, reqPath) || [];
        } else {
            // 如果请求为文件，则读取文件内容
            _content = await file(fullPath);
        }
    }
    return _content;
}
export default content;
