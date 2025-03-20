import { StatusEnum } from "@/constants/DataMap";
import PlatformModel from "@/models/PlatformModel";
import { Op } from "sequelize";


class PlatformService {

    // 获取全部已启用平台列表
    static async queryActivedRecords(params?: any) {
        const where: any = {
            status: StatusEnum.ENABLE,
        }
        if (params?.type) {
            where.type = params.type;
        }
        const result = await PlatformModel.findAll({
            where,
            attributes: { exclude: ["apiKey", "host"] }, // 过滤字段
        });
        return result;
    }


    // 查询平台列表
    static async queryPlatformList(params: any, ops = { safe: true }) {
        if (!params) {
            return false;
        }
        let { current, pageSize, orders } = params;
        const { name, code, type, status, startDate, endDate } = params;
        current = current ? Number.parseInt(current) : 1;
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

        const result = await PlatformModel.findAndCountAll({
            where: where,
            attributes: ops?.safe ? { exclude: ["apiKey", "host"] } : undefined,
            offset: (current - 1) * pageSize,
            limit: pageSize,
            order: orderArray,
        }).then((data) => {
            return Promise.resolve({
                current: current,
                pageSize: pageSize,
                total: data?.count,
                list: data?.rows
            });
        });
        return result;
    }


    // 查询平台信息-byIdOrName
    static async findPlatformByIdOrName(platform: string, params = { safe: true }) {
        if (!platform) {
            throw new Error("参数错误");
        }
        const platformInfo = await PlatformModel.findOne({
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

    // 查询平台信息-byId
    static async findPlatformById(id: string, params = { safe: true }) {
        if (!id) {
            throw new Error("参数错误");
        }
        const platformInfo = await PlatformModel.findOne({
            where: {
                id: id,
            },
            attributes: params?.safe ? { exclude: ["apiKey", "host"] } : undefined,
        });
        return platformInfo;
    }


    // 查询平台信息-byName
    static async findPlatformByName(name: string, params = { safe: true }) {
        if (!name) {
            throw new Error("参数错误");
        }
        const platformInfo = await PlatformModel.findOne({
            where: {
                name: name,
            },
            attributes: params?.safe ? { exclude: ["apiKey", "host"] } : undefined,
        });
        return platformInfo;
    }
    // 添加平台
    static async addPlatform(data: any) {
        try {
            if (!data) {
                throw new Error("参数错误");
            }
            const unique = await PlatformModel.judgeUnique(data);
            if (!unique) {
                throw new Error("平台已存在");
            }
            return await PlatformModel.create({
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
    
    // 修改平台
    static async updatePlatform(id: string, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        const unique = await PlatformModel.judgeUnique(data, id);
        if (!unique) {
            throw new Error("平台已存在");
        }
        return await PlatformModel.update({
            ...data,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        }, {
            where: {
                id: id,
            },
        });
    }
    // 删除AI
    // 删除平台
    static async deletePlatform(id: string) {
        if (!id) {
            throw new Error("参数错误");
        }
        return await PlatformModel.destroy({
            where: {
                id: id,
            },
        });
    }
}

export default PlatformService