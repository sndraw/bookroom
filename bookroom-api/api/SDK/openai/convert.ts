import mimeTypes from "mime-types";
import { createFileClient, getObjectName } from '@/common/file';
import { MessageType } from '../agent/message';
import { parseFileToStr } from '@/utils/file/convert';
import { isUrl } from '@/utils/file/file';

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
    noUsage?: boolean;
}) => {
    const { noSearch = true, noThink = true, noUsage = true } = options || {};
    let regex = null;
    let result = content;
    if (noSearch) {
        // 删除<search>标签和<think>标签包裹的内容
        regex = /<search>[\s\S]*?<\/search>/g;
        result = result.replace(regex, '');
    }
    if (noThink) {
        // 删除<think>标签包裹的内容
        regex = /<think>[\s\S]*?<\/think>/g;
        result = result.replace(regex, '');
    }

    if (noUsage) {
        // 删除<usage>标签包裹的内容
        regex = /<usage>[\s\S]*?<\/usage>/g;
        result = result.replace(regex, '');
    }

    return result;
};

// 转换函数的参数类型
interface ConvertParamsType {
    messages: any[];
    isConvertFile?: boolean;
    noThink?: boolean;
    noSearch?: boolean;
    noUsage?: boolean;
    userId?: string;
}
// 转换messages为模型输入格式
export const convertMessagesToVLModelInput = async (params: ConvertParamsType): Promise<any> => {
    const { messages } = params;
    if (!messages || !Array.isArray(messages)) {
        return null;
    }

    const newMessageList: any[] = [];
    // 循环messages
    for (const message of messages) {
        const newMessage = await convertFilesToContent(message, params);
        newMessageList.push(newMessage);
    }
    return newMessageList;
}

// 转换文件为内容
export const convertFilesToContent = async (message: MessageType, params: ConvertParamsType) => {
    // 解构message，其他属性
    const { content, images, videos, audios, files, ...rest } = message;

    // 定义新消息列表
    let newMessage: MessageType = {
        ...rest,
        content: []
    };
    const { isConvertFile = true, noThink = true, noSearch = true, noUsage = true, userId } = params;

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
        return newMessage;
    }
    if (typeof content === "string") {
        /**  删除所有的search和think标签，减少tokens消耗 */
        const newText = filterContent(content, {
            noThink,
            noSearch,
            noUsage
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
                const newText = filterContent(item?.text, {
                    noSearch,
                    noThink,
                    noUsage,
                })
                /**  过滤并保存历史聊天记录到文件/数据库并进行向量化，需要的时候可以通过接口读取 */
                // TODO
                newContent.text = newText || ""
            }
            newMessage.content.push(newContent);
        }
    }
    // 如果设定不转换文件，则全部转换为text类型
    if (!isConvertFile) {
        const mediaList = [...(images || []), ...(audios || []), ...(videos || []), ...(files || [])]
        if (mediaList.length > 0) {
            for (const item of mediaList) {
                let text = item;
                // 如果文件是对象，拼装成文本内容
                if (typeof item === "object" && item?.id) {
                    const fileUrl = item?.objectId || item?.id;
                    const fileName = item?.name || item?.id;
                    text = `[${fileName}](${fileUrl})`;
                }
                // 如果文件是字符串，直接拼装成文本内容
                if (typeof item === "string") {
                    text = `[${item}](${item})`;
                }
                newMessage.content.push({
                    type: "text",
                    text: text
                })
            }

        }
        return newMessage;
    }


    if (images && Array.isArray(images)) {
        for (const item of images) {
            const message = {
                type: "image_url",
                image_url: {
                    url: item,
                }
            }
            if (typeof item === "string" && !isUrl(item)) {
                try {
                    const dataStr = await parseFileToStr(item, userId)
                    if (!dataStr) continue;
                    message.image_url.url = dataStr;
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
            if (typeof item === "string" && !isUrl(item)) {
                try {
                    const dataStr = await parseFileToStr(item, userId)
                    if (!dataStr) continue;
                    const mimeType = mimeTypes.lookup(item);
                    const fileType = mimeTypes.extension(mimeType || "");
                    message.input_audio = {
                        data: dataStr,
                        format: fileType || "mp3",
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
            if (typeof item === "string" && !isUrl(item)) {
                try {
                    const dataStr = await parseFileToStr(item, userId)
                    if (!dataStr) continue;
                    message.video_url = {
                        url: dataStr,
                    }
                } catch (error) {
                    console.error('获取视频失败:', error);
                    continue;
                }
            }
            newMessage.content.push(message);
        }
    }

    if (files && Array.isArray(files)) {
        for (const item of files) {
            let text = item;
            // 如果文件是对象，拼装成文本内容
            if (typeof item === "object" && item?.id) {
                const fileUrl = item?.objectId || item?.id;
                const fileName = item?.name || item?.id;
                const objectName = getObjectName(fileUrl, userId);
                if (typeof fileUrl === "string" && !isUrl(fileUrl)) {
                    text = await parseFileToStr(fileUrl, userId);
                    if (text) {
                        newMessage.content.push({
                            type: "text",
                            text: `文件名: ${fileName}\n`
                        });
                        newMessage.content.push({
                            type: "text",
                            text: `文件内容: ${text}\n`
                        })
                        continue;
                    }
                    // 获取预签名下载地址
                    const presignedUrl = await createFileClient().presignedGetObject({ objectName });
                    text = `[${item?.name || item?.id}](${presignedUrl || fileUrl})`;
                    newMessage.content.push({
                        type: "text",
                        text: text
                    })
                    continue;
                }
                text = `[${fileName}](${fileUrl})`;
            }

            // 如果文件是字符串，直接拼装成文本内容
            if (typeof item === "string") {
                text = `[${item}](${item})`;
            }
            newMessage.content.push({
                type: "text",
                text: text
            })
        }
    }

    return newMessage;
}

