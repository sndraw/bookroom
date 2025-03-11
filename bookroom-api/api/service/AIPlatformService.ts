import { StatusEnum } from "@/constants/DataMap";
import AIPlatformModel from "../models/AIPlatformlModel"
import { Op } from "sequelize";


class AIPlatformService {

    // 获取全部已启用平台列表
    static async queryActivedRecords(params?: any) {
        const where: any = {
            status: StatusEnum.ENABLE,
        }
        if (params?.type) {
            where.type = params.type;
        }
        const result = await AIPlatformModel.findAll({
            where,
            attributes: { exclude: ["apiKey", "host"] }, // 过滤字段
        });
        return result;
    }


    // 查询AI配置列表
    static async queryAIPlatformList(params: any, ops = { safe: true }) {
        if (!params) {
            return false;
        }
        let { page, pageSize, orders } = params;
        const { name, code, type, status, startDate, endDate } = params;
        page = page ? Number.parseInt(page) : 1;
        pageSize = pageSize ? Number.parseInt(pageSize) : 10;
        let orderArray = [];
        if (orders) {
            const orderObject = JSON.parse(orders);
            if (
                orderObject &&
                typeof orderObject === "object" &&
                !Array.isArray(orderObject)
            ) {
                Object.keys(orderObject).forEach((key) => {
                    const item = orderObject[key];
                    orderArray.push([key, item]);
                });
            }
            if (Array.isArray(orderObject)) {
                orderArray = orderObject;
            }
        }
        const where: any = {};
        if (name) {
            where.name = {
                [Op.like]: `%${name}%`,
            };
        }
        if (code) {
            where.code = code;
        }
        if (type) {
            where.type = type;
        }
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            if (startDate && !endDate) {
                where.createdAt = {
                    [Op.gte]: startDate,
                };
            }
            if (!startDate && endDate) {
                where.createdAt = {
                    [Op.lte]: endDate,
                };
            }
            if (startDate && endDate) {
                where.createdAt = {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                };
            }
        }

        const result = await AIPlatformModel.findAndCountAll({
            where: where,
            attributes: ops?.safe ? { exclude: ["apiKey", "host"] } : undefined,
            offset: (page - 1) * pageSize,
            limit: pageSize,
            order: orderArray,
        }).then((data) => {
            return Promise.resolve({
                page: page,
                pageSize: pageSize,
                total: data?.count,
                list: data?.rows
            });
        });
        return result;
    }


    // 查询AI配置信息-byIdOrName
    static async findAIPlatformByIdOrName(platform: string, params = { safe: true }) {
        if (!platform) {
            throw new Error("参数错误");
        }
        const platformInfo = await AIPlatformModel.findOne({
            where: {
                [Op.or]: [
                    {
                        id: platform,
                    },
                    {
                        name: platform,
                    },
                ],
            },
            attributes: params?.safe ? { exclude: ["apiKey", "host"] } : undefined,
        });
        return platformInfo;
    }

    // 查询AI配置信息-byId
    static async findAIPlatformById(id: string, params = { safe: true }) {
        if (!id) {
            throw new Error("参数错误");
        }
        const platformInfo = await AIPlatformModel.findOne({
            where: {
                id: id,
            },
            attributes: params?.safe ? { exclude: ["apiKey", "host"] } : undefined,
        });
        return platformInfo;
    }


    // 查询AI配置信息-byName
    static async findAIPlatformByName(name: string, params = { safe: true }) {
        if (!name) {
            throw new Error("参数错误");
        }
        const platformInfo= await AIPlatformModel.findOne({
            where: {
                name: name,
            },
            attributes: params?.safe ? { exclude: ["apiKey", "host"] } : undefined,
        });
        return platformInfo;
    }
    // 添加AI配置
    static async addAIPlatform(data: any) {
        try {
            if (!data) {
                throw new Error("参数错误");
            }
            const unique = await AIPlatformModel.judgeUnique(data);
            if (!unique) {
                throw new Error("AI配置已存在");
            }
            return await AIPlatformModel.create({
                ...data,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
        }
        catch (e) {
            const error: any = e;
            throw error;
        }
    }
    // 修改AI配置
    static async updateAIPlatform(id: string, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        const unique = await AIPlatformModel.judgeUnique(data, id);
        if (!unique) {
            throw new Error("AI配置已存在");
        }
        return await AIPlatformModel.update({
            ...data,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        }, {
            where: {
                id: id,
            },
        });
    }
    // 删除AI配置
    static async deleteAIPlatform(id: string) {
        if (!id) {
            throw new Error("参数错误");
        }
        return await AIPlatformModel.destroy({
            where: {
                id: id,
            },
        });
    }
}

export default AIPlatformService