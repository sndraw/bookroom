
// 文件上传类型
export const UPLOAD_FILE_TYPE = process.env.UMI_APP_UPLOAD_FILE_ACCEPT ? process.env.UMI_APP_UPLOAD_FILE_ACCEPT?.split(',') : [
    // 图像文件类型
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
    // 文档文件类型
    '.txt',
    '.text',
    '.json',
    '.md',
    '.pdf',
    '.docx',
    '.csv',
    // 表格类型
    '.xlsx',
    '.xls',
    // 音频文件类型
    '.mp3',
    '.wav',
    '.ogg',
    '.flac',
    '.opus',
    '.pcm16',
    // 视频文件类型
    '.mp4',
    '.avi',
    '.mkv',
    '.flv',
    '.mov',
    '.wmv',
];


// 文件上传大小限制(Byte)
export const UPLOAD_FILE_SIZE_LIMIT = Number(process.env.UMI_APP_UPLOAD_FILE_LIMIT || 100 * 1024) * 1024; // 默认100MB