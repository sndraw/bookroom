import { getOrderArray } from "@/utils/query";
import UserTokenModel from "../models/UserTokenModel";
import { Identifier, Op, Optional } from "sequelize";
class UserTokenService {
    // 获取列表
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { current, pageSize, sorter } = params;
        const { userIdKey, status, startDate, endDate } = params;
        current = current ? Number.parseInt(current) : 1;
        pageSize = pageSize ? Number.parseInt(pageSize) : 10;
        const where: any = {};
        if (userIdKey) {
            where.userId = {
                [Op.like]: `%${userIdKey}%`,
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

        const result = await UserTokenModel.findAndCountAll({
            where: where,
            attributes: { exclude: [] }, // 过滤字段
            offset: (current - 1) * pageSize,
            limit: pageSize,
            order: getOrderArray(sorter),
        }).then((data) => {
            return Promise.resolve({
                current: current,
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
        const result = await UserTokenModel.findByPk(id);
        return result;
    }

    // 查询单条数据-ByUserId
    static async findRecordByUserId(userId: any) {
        if (!userId) {
            throw new Error("参数错误");
        }
        const result = await UserTokenModel.findOne({
            where: {
                userId: userId,
            },
        });
        return result;
    }

    // 查询单条数据-ByToken
    static async findRecordByToken(token: any) {
        if (!token) {
            throw new Error("参数错误");
        }
        const result = await UserTokenModel.findOne({
            where: {
                token: token,
            },
        });
        return result;
    }

    // 添加数据
    static async addRecord(data: Optional<any, string> | undefined) {
        if (!data) {
            throw new Error("参数错误");
        }
        const result = await UserTokenModel.create({
            ...data,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        });
        return result;
    }

    // 更新数据
    static async updateRecord(id: any, data: { [x: string]: any; }) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        // 判定数据唯一性
        const unique = await UserTokenModel.judgeUnique(data, id);
        if (!unique) {
            throw new Error("数据已存在");
        }
        const result = await UserTokenModel.update(
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
        const result = await UserTokenModel.destroy({
            where: {
                id: id,
            },
        });
        return result;
    }
}

export default UserTokenService;
