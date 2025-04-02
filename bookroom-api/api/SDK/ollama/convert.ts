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
        if (message.images && Array.isArray(message.images)) {
            for (let i = 0; i < message.images.length; i++) {
                const fileId = message.images[i];
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