import * as fs from 'fs';
import * as path from 'path';

// 将文件转换为Base64编码
export const getFileBase64 = (filePath: string, vision = true): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject(new Error('文件不存在'));
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        if (!['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
            return reject(new Error('不支持的文件类型'));
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }

            const base64Data = `data:image/${fileExtension.replace('.', '')};base64,${data.toString('base64')}`;
            resolve(vision ? base64Data.split(',')[1] : base64Data);
        });
    });
};

// 将buffer转换为base64字符串
export const getFileBase64FromBuffer = (fileBuffer: Buffer, fileExtension = "png", vision = true): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!(fileBuffer instanceof Buffer)) {
            return reject(new Error('传入的不是一个 Buffer 对象'));
        }
        const base64Data = `data:image/${fileExtension};base64,${fileBuffer.toString('base64')}`;
        resolve(vision ? base64Data.split(',')[1] : base64Data);
    });
};