import PermissionModel from "../models/PermissionModel";
import { Identifier, Op } from "sequelize";

class PermissionService {
    // 获取列表
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { page, pageSize, orders } = params;
        const { nameKey, status, startDate, endDate } = params;
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
        if (nameKey) {
            where.name = {
                [Op.like]: `%${nameKey}%`,
            };
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

        const result = await PermissionModel.findAndCountAll({
            where: where,
            attributes: { exclude: [] }, // 过滤字段
            offset: (page - 1) * pageSize,
            limit: pageSize,
            order: orderArray,
        }).then((data) => {
            return Promise.resolve({
                page: page,
                pageSize: pageSize,
                data: data,
            });
        });
        return result;
    }

    // 查询单条数据-ById
    static async findRecordById(id: Identifier | undefined) {
        if (!id) {
            throw new Error("参数错误");
        }
        const result = await PermissionModel.findByPk(id);
        return result;
    }

    // 查询单条数据-ByName
    static async findRecordByName(name: string | string[]) {
        if (!name) {
            throw new Error("参数错误");
        }
        const result = await PermissionModel.findOne({
            where: {
                name: name,
            },
        });
        return result;
    }

    // 添加数据
    static async addRecord(data: any) {
        if (!data) {
            throw new Error("参数错误");
        }
        // 判定数据唯一性
        const unique = await PermissionModel.judgeUnique(data);
        if (!unique) {
            throw new Error("名称已存在");
        }
        try {
            const result = await PermissionModel.create({
                ...data,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
            return result;
        } catch (e) {
            const error: any = e;
            throw error;
        }
    }

    // 更新数据
    static async updateRecord(id: any, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        // 判定数据唯一性
        const unique = await PermissionModel.judgeUnique(data, id);
        if (!unique) {
            throw new Error("参数错误");
        }
        const result = await PermissionModel.update(
            {
                ...data,
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    id: id,
                },
            }
        );
        return result;
    }

    // 删除数据
    static async deleteRecord(id: any) {
        if (!id) {
            throw new Error("参数错误");
        }
        const result = await PermissionModel.destroy({
            where: {
                id: id,
            },
        });
        return result;
    }
}

export default PermissionService;
