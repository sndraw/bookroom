import ExcelJS from 'exceljs';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { createFileClient, getObjectName } from '@/common/file';
import { isAudio, isImage, isUrl, isVideo } from './file';

export const getFileName = (fileUrl: string) => {
    // 如果不是字符串
    if (typeof fileUrl !== "string") {
        return "";
    }
    const fileName = (fileUrl.split("/").pop())?.toLowerCase();
    return fileName || "";
}
export const parseFileToStr = async (fileUrl: string, userId?: string): Promise<string> => {
    let text: string = "";
    // 如果不是字符串而且还是url
    if (typeof fileUrl !== "string" || isUrl(fileUrl)) {
        return text;
    }
    // 获取文件名
    const fileName = getFileName(fileUrl)

    const objectName = getObjectName(fileUrl, userId);
    // 如果是excel文件，下载并读取内容
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".xlsm")) {
        const fileBuffer: any = await createFileClient().getObjectData({ objectName, encodingType: "buffer" });
        if (!fileBuffer) return text;
        const res = await processExcelFromBuffer(fileBuffer);
        // 如果不是字符串,则跳过处理
        if (typeof res !== "string") {
            return text;
        }
        text = res;
    }
    // 如果txt文件，下载并读取内容
    if (fileName.endsWith(".txt") || fileName.endsWith(".text") || fileName.endsWith(".csv") || fileName.endsWith(".md") || fileName.endsWith(".json")) {
        const fileBuffer: any = await createFileClient().getObjectData({ objectName, encodingType: "buffer" });
        if (!fileBuffer) return text;
        text = fileBuffer.toString("utf-8");
    }
    // 如果是docx文件，下载并读取内容
    if (fileName.endsWith(".docx")) {
        const fileBuffer: any = await createFileClient().getObjectData({ objectName, encodingType: "buffer" });
        if (!fileBuffer) return text;
        text = await mammoth.extractRawText({ buffer: fileBuffer })
            .then(result => {
                console.log("Extracted text from .docx:", result.value);
                return result.value;
            })
            .catch(err => {
                console.error("Error parsing .docx from buffer:", err);
                return ""
            });
    }
    // 如果是pdf文件，下载并读取内容
    if (fileName.endsWith(".pdf")) {
        const fileBuffer: any = await createFileClient().getObjectData({ objectName, encodingType: "buffer" });
        if (!fileBuffer) return text;
        const pdfResult = await pdfParse(fileBuffer);
        if (pdfResult && pdfResult?.text) {
            text = pdfResult.text;
        }
    }
    // 如果是图片，下载并读取内容
    if (isImage(fileUrl)) {
        const audioObj: any = await createFileClient().getObjectData({
            objectName,
            encodingType: "base64",
            addFileType: true,
        })
        text = audioObj?.dataStr || ""
    }
    // 如果是音频文件，下载并读取内容
    if (isAudio(fileUrl)) {
        const audioObj: any = await createFileClient().getObjectData({
            objectName,
            encodingType: "base64",
            addFileType: true,
        })
        text = audioObj?.dataStr || ""
    }
    // 如果是视频文件，下载并读取内容
    if (isVideo(fileUrl)) {
        const videoObj: any = await createFileClient().getObjectData({
            objectName,
            encodingType: "base64",
            addFileType: true,
        })
        text = videoObj?.dataStr || ""
    }
    return text;
}


export const processExcelFromBuffer = async (buffer: ExcelJS.Buffer) => {
    const workbook = new ExcelJS.Workbook();
    // 使用 Buffer 加载 Excel 文件
    return await workbook.xlsx.load(buffer)
        .then(() => {
            let textOutput = '';
            // 遍历每个工作表
            workbook.eachSheet((worksheet, sheetId) => {
                textOutput += `Sheet ${sheetId} (${worksheet.name}):\n`;

                // 遍历每一行和单元格
                worksheet.eachRow((row, rowNumber) => {
                    row.eachCell((cell, colNumber) => {
                        if (colNumber === 1) {
                            textOutput += `Row ${rowNumber}: `;
                        }
                        let text = cell.value;
                        if (typeof cell.value === "object") {
                            text = JSON.stringify(cell.value, null, 2);
                        }
                        textOutput += `${text}\t`;
                    });
                });

                textOutput += '\n'; // 添加空行分隔不同工作表
            });
            return textOutput;
        })
        .catch(err => {
            console.error("解析 Excel 文件失败:", err);
        });
}