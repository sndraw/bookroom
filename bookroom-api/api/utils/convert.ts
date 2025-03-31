import { createFileClient, getObjectName } from '@/common/file';


// 转换图片列表为模型输入格式
export const convertImagesToVLModelInput = async (params: {
    text: string;
    images: string;
    userId?: string;
}) => {
    const { text, images, userId } = params;
    if (!images) {
        return null;
    };
    const userMessage: any = {
        role: "user",
        content: [],
    };

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
                    const imageObj: any = await createFileClient().getObjectData({
                        objectName,
                        encodingType: "base64",
                        addFileType: true,
                    })
                    if (!imageObj?.dataStr) continue;
                    message.image_url.url = imageObj?.dataStr;
                }
                catch (error) {
                    console.error('获取图片失败:', error);
                    continue;
                }
            }
            userMessage.content.push(message);
        }
    }
    userMessage.content.push(
        { type: "text", text: text }
    )
    return userMessage;
}

// 转换messages为模型输入格式
export const convertMessagesToVLModelInput = async (params: {
    messages: any[];
    userId?: string;
}) => {
    const { messages, userId } = params;
    if (!messages || !Array.isArray(messages)) {
        return null;
    }

    const newMessageList: any[] = [];
    // 循环messages
    for (const message of messages) {
        const newMessage: any = {
             ...message,// 复制message的所有属性到newMessage
            content: []
        };
        // 如果是system
        if (message.role === "system") {
            const content = message.content;
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
        // 如果是user或assistant
        if (message.role === "user" || message.role === "assistant" || message.role === "tool") {
            const content = message?.content;
            const images = message?.images;
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
                            const imageObj: any = await createFileClient().getObjectData({
                                objectName,
                                encodingType: "base64",
                                addFileType: true,
                            })
                            if (!imageObj?.dataStr) continue;
                            message.image_url.url = imageObj?.dataStr;
                        }
                        catch (error) {
                            console.error('获取图片失败:', error);
                            continue;
                        }
                    }
                    newMessage.content.push(message);
                }
            }
            const audios = message?.audios;
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
            const videos = message?.videos;
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
                newMessage.content.push({
                    type: "text",
                    text: content || "Hello!"
                });
            }
            if (Array.isArray(content)) {
                newMessage.content.push(...content);
            }
        }

        newMessageList.push(newMessage);
    }
    return newMessageList;

}