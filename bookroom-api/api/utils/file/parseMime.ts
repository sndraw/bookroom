
const path = require("path");
const mimes = require("./mimes");

function parseMime (url: any) {
    let extName = path.extname(url);
    extName = extName ? extName.slice(1) : "unknown";
    return mimes[extName];
}

export default parseMime;