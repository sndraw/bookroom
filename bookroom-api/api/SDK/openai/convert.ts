import { createFileClient, getObjectName } from '@/common/file';
// 转换图片列表为模型输入格式
export const convertImagesToVLModelInput = async (params: {
    images: string;
    userId?: string;
}): Promise<any> => {
    const { images, userId } = params;
    if (!images) {
        return null;
    };
    let newImages = [];
    if (images && Array.isArray(images)) {
        newImages = JSON.parse(JSON.stringify(images));
        for (let i = 0; i < newImages.length; i++) {
            const fileId = newImages[i];
            if (typeof fileId === "string") {
                try {
                    const objectName = getObjectName(fileId, userId);
                    const fileObj: any = await createFileClient().getObjectData({
                        objectName,
                        encodingType: "base64",
                        addFileType: true,
                    });
                    if (!fileObj?.dataStr) continue;
                    newImages[i] = fileObj?.dataStr;
                } catch (error) {
                    console.error('获取图片失败:', error);
                    continue;
                }
            }
        }
    }
    return newImages;
}
// 过滤内容
export const filterContent = (content: string, options?: {
    noSearch?: boolean;
    noThink?: boolean;
}) => {
    const { noSearch = true, noThink = true } = options || {};
    let regex = null;
    let result = content;
    if (noSearch) {
        // 删除<search>标签和<think>标签包裹的内容
        regex = /<search>[\s\S]*?<\/search>/g;
        result = result.replace(regex, '');
    }
    if (noThink) {
        regex = /<think>[\s\S]*?<\/think>/g;
        result = result.replace(regex, '');
    }
    return result;
};


// 转换messages为模型输入格式
export const convertMessagesToVLModelInput = async (params: {
    messages: any[];
    noThink?: boolean;
    noSearch?: boolean;
    userId?: string;
}): Promise<any> => {
    const { messages, noThink = false, noSearch  = false, userId } = params;
    if (!messages || !Array.isArray(messages)) {
        return null;
    }

    const newMessageList: any[] = [];
    // 循环messages
    for (const message of messages) {
        // 解构message，其他属性
        const { content, images, videos, audios, ...rest } = message;

        // 定义新消息列表
        const newMessage: any = {
            ...rest,
            content: []
        };
        // 如果是system
        if (message.role === "system") {
            if (typeof content === "string") {
                newMessage.content.push({
                    type: "text",
                    text: content
                });
            }
            if (Array.isArray(content)) {
                newMessage.content.push(...content);
            }
        }
        // 如果是user或assistant或者tool
        if (message.role === "user" || message.role === "assistant" || message.role === "tool") {
            if (images && Array.isArray(images)) {
                for (const item of images) {
                    const message = {
                        type: "image_url",
                        image_url: {
                            url: item,
                        }
                    }
                    if (typeof item === "string" && (!item.startsWith("http") || !item.startsWith("https"))) {
                        try {
                            const objectName = getObjectName(item, userId);
                            const fileObj: any = await createFileClient().getObjectData({
                                objectName,
                                encodingType: "base64",
                                addFileType: true,
                            })
                            if (!fileObj?.dataStr) continue;
                            message.image_url.url = fileObj?.dataStr;
                        }
                        catch (error) {
                            console.error('获取图片失败:', error);
                            continue;
                        }
                    }
                    newMessage.content.push(message);
                }
            }
            if (audios && Array.isArray(audios)) {
                for (const item of audios) {
                    const message = {
                        type: "input_audio",
                        input_audio: {
                            data: item,
                            format: "mp3" //默认格式为mp3，实际格式可能需要根据实际情况进行调整
                        }
                    }
                    if (typeof item === "string" && (!item.startsWith("http") || !item.startsWith("https"))) {
                        try {
                            const objectName = getObjectName(item, userId);
                            const audioObj: any = await createFileClient().getObjectData({
                                objectName,
                                encodingType: "base64",
                                addFileType: true,
                            })
                            if (!audioObj?.dataStr) continue;
                            message.input_audio = {
                                data: audioObj?.dataStr,
                                format: audioObj?.fileType || "mp3",
                            }
                        } catch (error) {
                            console.error('获取音频失败:', error);
                            continue;
                        }
                    }
                    newMessage.content.push(message);
                }
            }
            if (videos && Array.isArray(videos)) {
                for (const item of videos) {
                    const message = {
                        type: "video_url",
                        video_url: {
                            url: item,
                        }
                    }
                    if (typeof item === "string" && (!item.startsWith("http") || !item.startsWith("https"))) {
                        try {
                            const objectName = getObjectName(item, userId);
                            const audioObj: any = await createFileClient().getObjectData({
                                objectName,
                                encodingType: "base64",
                                addFileType: true,
                            })
                            if (!audioObj?.dataStr) continue;
                            message.video_url = {
                                url: audioObj?.dataStr,
                            }
                        } catch (error) {
                            console.error('获取视频失败:', error);
                            continue;
                        }
                    }
                    newMessage.content.push(message);
                }
            }
            if (typeof content === "string") {
                /**  删除所有的search和think标签，减少tokens消耗 */
                const newText = filterContent(content,{
                    noThink,
                    noSearch,
                })
                /**  过滤并保存历史聊天记录到文件/数据库并进行向量化，需要的时候可以通过接口读取 */
                // TODO
                newMessage.content.push({
                    type: "text",
                    text: newText || ""
                });
            }
            if (Array.isArray(content)) {
                //    循环获取聊天内容
                for (const item of content) {
                    const newContent = {
                        ...item,
                    }
                    // 如果是text，则进行过滤处理
                    if (item?.type === "text" && item?.text) {
                        /**  删除所有的search和think标签，减少tokens消耗 */
                        const newText = filterContent(item?.text,{
                            noSearch,
                            noThink,
                        })
                        /**  过滤并保存历史聊天记录到文件/数据库并进行向量化，需要的时候可以通过接口读取 */
                        // TODO
                        newContent.text = newText || ""
                    }
                    newMessage.content.push(newContent);
                }
            }
        }
        newMessageList.push(newMessage);
    }
    return newMessageList;
}