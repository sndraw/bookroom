export const isImage = (url: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
};
export const isVideo = (url: string) => {
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
};
export const isAudio = (url: string) => {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'opus', 'pcm16'];
    return audioExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
};

export const isUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
};

export const isMediaObjectId = (url: string) => {
    return (isAudio(url) || isVideo(url) || isImage(url)) && !isUrl(url)
}


