
// 文件上传类型
export const UPLOAD_FILE_TYPE = process.env.UMI_APP_UPLOAD_FILE_ACCEPT ? process.env.UMI_APP_UPLOAD_FILE_ACCEPT?.split(',') : [
    // 图像文件类型
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.svg',
    '.ico',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/x-icon',
    // 文档文件类型
    '.txt',
    '.md',
    '.pdf',
    '.docx',
    '.pptx',
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // 音频文件类型
    '.mp3',
    '.wav',
    '.ogg',
    '.flac',
    '.opus',
    '.pcm16',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'audio/opus',
    'audio/x-pcm',
    // 视频文件类型
    '.mp4',
    '.avi',
    '.mkv',
    '.flv',
    '.mov',
    '.wmv',
    'video/mp4',
    'video/x-msvideo',
    'video/x-matroska',
    'video/quicktime',
    'video/x-ms-asf',
    'video/x-flv',
    'videe/x-ms-wmv',
    'video/x-ms-asf',
];


// 文件上传大小限制(Byte)
export const UPLOAD_FILE_SIZE_LIMIT = Number(process.env.UMI_APP_UPLOAD_FILE_LIMIT || 100 * 1024) * 1024; // 默认100MB