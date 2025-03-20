import { StatusEnum } from "@/constants/DataMap";
import LoginLogModel from "../models/LoginLogModel";
import { Identifier, Op } from "sequelize";
// 登录错误最大尝试次数
const LOGIN_MAX_ERROR_COUNT = Number(process.env?.LOGIN_MAX_ERROR_COUNT || 3);
// 登录错误锁定时间(分钟)
const LOGIN_LOCK_TIME = Number(process.env?.LOGIN_LOCK_TIME || 5);

class LoginLogService {
    // 获取列表
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { current, pageSize, orders } = params;
        const { status, startDate, endDate } = params;
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

        const result = await LoginLogModel.findAndCountAll({
            where: where,
            attributes: { exclude: [] }, // 过滤字段
            offset: (current - 1) * pageSize,
            limit: pageSize,
            order: orderArray,
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
        const result = await LoginLogModel.findByPk(id);
        return result;
    }

    // 添加数据
    static async addRecord(data: any) {
        if (!data) {
            throw new Error("参数错误");
        }
        const transaction = await LoginLogModel?.sequelize?.transaction();
        try {
            const result = await LoginLogModel.create({
                ...data,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
            transaction?.commit();
            return result;
        } catch (e) {
            transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }

    // 更新数据
    static async updateRecord(id: any, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        const transaction = await LoginLogModel?.sequelize?.transaction();
        try {
            const result = await LoginLogModel.update(
                {
                    ...data,
                    updatedAt: new Date().getTime(),
                },
                {
                    where: {
                        id: id,
                    },
                    transaction
                }
            );
            await transaction?.commit();
            return result;
        }
        catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }

    // 删除数据
    static async deleteRecord(id: any) {
        if (!id) {
            throw new Error("参数错误");
        }
        const transaction = await LoginLogModel?.sequelize?.transaction();
        try {
            const result = await LoginLogModel.destroy({
                where: {
                    id: id,
                },
                transaction
            });
            await transaction?.commit();
            return result;
        }
        catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }

    // 是否允许登录
    static async isAllowLogin(userId: number) {
        if (!userId) {
            throw new Error("参数错误");
        }

        const maxMinutesAgo = new Date(Date.now() - LOGIN_LOCK_TIME * 60 * 1000);

        const userAttempts: any = await LoginLogModel.findOne({
            where: {
                userId: userId,
                lastAttemptTime: {
                    [Op.gte]: maxMinutesAgo,
                },
            },
            order: [['createdAt', 'DESC']],
        });

        if (userAttempts && userAttempts?.loginAttempts >= LOGIN_MAX_ERROR_COUNT) {
            return false;
        }

        return true;
    }

    // 记录登录尝试
    static async recordLoginAttempt(userId: number, success: boolean) {
        if (!userId) {
            throw new Error("参数错误");
        }

        const maxMinutesAgo = new Date(Date.now() - LOGIN_LOCK_TIME * 60 * 1000);
        const transaction = await LoginLogModel?.sequelize?.transaction();

        try {
            const userAttempts: any = await LoginLogModel.findOne({
                where: {
                    userId: userId,
                    lastAttemptTime: {
                        [Op.gte]: maxMinutesAgo,
                    },
                },
                order: [['createdAt', 'DESC']],
            });
            if (userAttempts) {
                if (success) {
                    userAttempts.loginAttempts = 0; // 重置尝试次数
                } else {
                    userAttempts.loginAttempts += 1; // 增加尝试次数
                }
                userAttempts.lastAttemptTime = new Date();
                await LoginLogModel.update({
                    ...userAttempts,
                    updatedAt: new Date(),
                }, {
                    where: {
                        id: userAttempts.id,
                    },
                });
            } else {
                await LoginLogModel.create({
                    userId: userId,
                    status: success ? StatusEnum.ENABLE: StatusEnum.DISABLE,
                    loginAttempts: success ? 0 : 1,
                    lastAttemptTime: new Date(),
                });
            }
            await transaction?.commit();
            return true;
        } catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }
}

export default LoginLogService;
