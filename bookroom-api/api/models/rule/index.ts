import { StatusEnum } from "@/constants/DataMap";

export const StatusModelRule = {
    isIn: {
        args: [[StatusEnum.ENABLE, StatusEnum.DISABLE]],
        msg: `状态值必须为${StatusEnum.ENABLE}或${StatusEnum.DISABLE}`,
    },
}