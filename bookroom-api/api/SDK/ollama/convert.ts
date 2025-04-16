import { createFileClient, getObjectName } from "@/common/file";

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
                        encodingType: "base64"
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

// 转换messages为模型输入格式
export const convertMessagesToVLModelInput = async (params: {
    messages: any[];
    userId?: string;
}): Promise<any> => {
    const { messages, userId } = params;
    if (!messages || !Array.isArray(messages)) {
        return null;
    }
    const newMessages = JSON.parse(JSON.stringify(messages));
    for (const message of newMessages) {
        const { content, images } = message || {};
        if (Array.isArray(content)) {
            let newContent = "";
            //    循环获取聊天内容
            for (const item of content) {
            //   如果是字符串，直接添加到newContent中
               if (typeof item === "string") {
                    newContent += item;
                }
                // 如果是对象，检查是否有text属性，如果有则添加到newContent中
                else if (item && typeof item === "object" && item.text) {
                    newContent += item.text;
                }
            }
            message.content = newContent;
        }
        if (images && Array.isArray(images)) {
            for (let i = 0; i < images.length; i++) {
                const fileId = images[i];
                if (typeof fileId === "string") {
                    const objectName = getObjectName(fileId, userId);
                    try {
                        const fileObj: any = await createFileClient().getObjectData(
                            {
                                objectName,
                                encodingType: "base64"
                            },
                        );
                        if (!fileObj?.dataStr) continue;
                        message.images[i] = fileObj?.dataStr;
                    } catch (error) {
                        console.error('获取图片失败:', error);
                        continue;
                    }
                }
            }
        }
    }

    return newMessages;
}