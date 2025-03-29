import { getOrderArray } from "@/utils/query";
import UserRoleModel from "../models/UserRoleModel";
import { Identifier, Op } from "sequelize";

class UserRolesService {
    // 获取列表
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { current, pageSize, sorter } = params;
        const { userIdKey, roleIdKey, status, startDate, endDate } = params;
        current = current ? Number.parseInt(current) : 1;
        pageSize = pageSize ? Number.parseInt(pageSize) : 10;
        const where: any = {};
        if (userIdKey) {
            where.userId = {
                [Op.like]: `%${userIdKey}%`,
            };
        }
        if (roleIdKey) {
            where.roleId = {
                [Op.like]: `%${roleIdKey}%`,
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

        const result = await UserRoleModel.findAndCountAll({
            where: where,
            attributes: { exclude: [] }, // 过滤字段
            offset: (current - 1) * pageSize,
            limit: pageSize,
            order: getOrderArray(sorter)
        }).then((data) => {
            return Promise.resolve({
                current: current,
                pageSize: pageSize,
                data: data,
            });
        });
        return result;
    }

    // 查询单条数据-ByUserId
    static async findRecordByUserId(userId: Identifier | undefined) {
        if (!userId) {
            throw new Error("参数错误");
        }
        const result = await UserRoleModel.findOne({
            where: {
                userId: userId,
            },
        });
        return result;
    }

    // 查询单条数据-ByRoleId
    static async findRecordByRoleId(roleId: Identifier | undefined) {
        if (!roleId) {
            throw new Error("参数错误");
        }
        const result = await UserRoleModel.findOne({
            where: {
                roleId,
            },
        });
        return result;
    }

    // 查询单条数据-ById
    static async findRecordById(id: Identifier | undefined) {
        if (!id) {
            throw new Error("参数错误");
        }
        const result = await UserRoleModel.findByPk(id);
        return result;
    }

    // 添加数据
    static async addRecord(data: any) {
        if (!data) {
            throw new Error("参数错误");
        }
        try {
            const result = await UserRoleModel.create({
                ...data,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
            return result;
        } catch (e) {
            const error: any = e;
            throw error;
        }
        return false
    }

    // 更新数据
    static async updateRecord(id: any, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        const result = await UserRoleModel.update(
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
        const result = await UserRoleModel.destroy({
            where: {
                id: id,
            },
        });
        return result;
    }
}

export default UserRolesService;
