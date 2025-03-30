import UserModel from "../models/UserModel";

import { Identifier, Op } from "sequelize";
import UserRoleModel from "../models/UserRoleModel";
import RoleModel from "../models/RoleModel";
import { StatusEnum } from "@/constants/DataMap";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import { getOrderArray } from "@/utils/query";

class UserService {
    // 获取列表
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { current, pageSize, sorter } = params;
        const { username, email, status, roleId, startDate, endDate } = params;
        current = current ? Number.parseInt(current) : 1;
        pageSize = pageSize ? Number.parseInt(pageSize) : 10;
        // 查询用户角色
        const adminRoleObj = (await RoleModel.findOne({
            where: {
                code: USER_ROLE_ENUM.ADMIN
            }
        }))?.toJSON();

        const where: any = {};
        const roleWhere: any = {
            id: {
                [Op.not]: adminRoleObj?.id
            }
        }
        if (username) {
            where.username = {
                [Op.like]: `%${username}%`
            };
        }
        if (email) {
            where.email = {
                [Op.like]: `%${email}%`,
            };
        }
        if (roleId) {
            roleWhere.id[Op.eq] = roleId;
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

        const result = await UserModel.findAndCountAll({
            where: where,
            attributes: { exclude: ["password", "salt"] }, // 过滤字段
            offset: (current - 1) * pageSize,
            limit: pageSize,
            order: getOrderArray(sorter),
            include: [
                {
                    model: RoleModel,
                    attributes: ["name", "code", "id"],
                    through: {
                        attributes: [],
                    },
                    where: roleWhere,
                    required: true, // 使用左连接
                },
            ],
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

    // 查询单条数据-ById-过滤掉密码字段
    static async findRecordById(id: Identifier | undefined) {
        if (!id) {
            throw new Error("参数错误");
        }
        const result = await UserModel.findByPk(id, {
            attributes: { exclude: ["password", "salt"] }, // 过滤字段
            include: [
                {
                    model: RoleModel,
                    through: {
                        attributes: [],
                    },
                    required: false, // 使用左连接
                },
            ],
        });
        return result;
    }

    // 查询单条数据-ByUsername
    static async findRecordByUsername(username: string | string[]) {
        if (!username) {
            throw new Error("参数错误");
        }
        const result = await UserModel.findOne({
            where: {
                username: username,
            },
            include: [
                {
                    model: RoleModel,
                    through: {
                        attributes: [],
                    },
                    required: false, // 使用左连接
                },
            ],
        });
        return result;
    }

    // 查询单条数据-ByEmail
    static async findRecordByEmail(email: any) {
        if (!email) {
            throw new Error("参数错误");
        }
        const result = await UserModel.findOne({
            where: {
                email: email,
            },
            include: [
                {
                    model: RoleModel,
                    through: {
                        attributes: [],
                    },
                    required: false, // 使用左连接
                },
            ],
        });
        return result;
    }

    // 添加数据
    static async addRecord(data: any) {
        if (!data) {
            throw new Error("参数错误");
        }
        // 判定数据唯一性
        const unique = await UserModel.judgeUnique(data);
        if (!unique) {
            throw new Error("用户名或者邮箱已存在");
        }
        const transaction = await UserModel?.sequelize?.transaction();

        try {
            // 密码加密
            const hashPasswordObj = await UserModel.encryptPassword(data.password);
            data = {
                ...data,
                password: hashPasswordObj.content,
                salt: hashPasswordObj.iv,
            };
            const result = await UserModel.create({
                ...data,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });

            await transaction?.commit();
            return result;
        } catch (e) {
            await transaction?.rollback();
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
        // 判定数据唯一性
        const unique = await UserModel.judgeUnique(data, id);
        if (!unique) {
            throw new Error("用户已存在");
        }
        // 如果更新了密码
        if (data.password) {
            // 密码加密
            const hashPasswordObj = await UserModel.encryptPassword(data.password);
            data = {
                ...data,
                password: hashPasswordObj.content,
                salt: hashPasswordObj.iv,
            };
        }
        const transaction = await UserModel?.sequelize?.transaction();
        try {
            const result = await UserModel.update(
                {
                    ...data,
                    updatedAt: new Date().getTime(),
                },
                {
                    where: {
                        id: id,
                    },
                },
            );
            await transaction?.commit();
            return result;
        } catch (e) {
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
        const transaction = await UserModel?.sequelize?.transaction();
        try {
            const result = await UserModel.destroy({
                where: {
                    id: id,
                },
            });
            await transaction?.commit();
            return result;
        } catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }

    // 校验密码是否正确
    static async checkPassword(password: string | string[], salt: null | undefined, hashPassword: string) {
        const hashPasswordObj = await UserModel.encryptPassword(password, salt);
        if (hashPasswordObj.content === hashPassword) {
            return true;
        }
        return false;
    }


    // 添加用户及角色
    static async addUserAndRole(data: any) {
        if (!data) {
            throw new Error("参数错误");
        }
        // 判定数据唯一性-用户
        const uniqueUser = await UserModel.judgeUnique(data);
        if (!uniqueUser) {
            throw new Error("用户名或者邮箱已存在");
        }

        const transaction = await UserModel?.sequelize?.transaction();

        try {
            // 密码加密
            const hashPasswordObj = await UserModel.encryptPassword(data.password);
            const { roleId, ...userParams } = data
            const userdata = {
                ...userParams,
                password: hashPasswordObj.content,
                salt: hashPasswordObj.iv,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            };

            const user: any = await UserModel.create(userdata, {
                transaction: transaction, // 传递事务对象
            });

            // 判定数据唯一性-角色关联
            const uniqueUserRole = await UserRoleModel.judgeUnique({
                userId: user?.id,
                roleId: data?.roleId,
            });
            if (!uniqueUser) {
                throw new Error("角色已关联");
            }
            // 通过id查询用户角色
            const role: any = await RoleModel.findOne({
                where: {
                    id: data.roleId,
                    status: StatusEnum.ENABLE
                },
                transaction: transaction, // 传递事务对象
            });

            if (!role) {
                throw new Error("角色不存在");
            }

            await UserRoleModel.create({
                userId: user?.id,
                roleId: data.roleId,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            }, {
                transaction: transaction, // 传递事务对象
            });

            await transaction?.commit();
            return true;
        } catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }
    // 修改用户及角色
    static async updateUserAndRole(id: any, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        // 判定数据唯一性
        const unique = await UserModel.judgeUnique(data, id);
        if (!unique) {
            throw new Error("用户已存在");
        }
        // 如果更新了密码
        if (data.password) {
            // 密码加密
            const hashPasswordObj = await UserModel.encryptPassword(data.password);
            data = {
                ...data,
                password: hashPasswordObj.content,
                salt: hashPasswordObj.iv,
            };
        }
        const transaction = await UserModel?.sequelize?.transaction();
        try {
            const result = await UserModel.update(
                {
                    ...data,
                    updatedAt: new Date().getTime(),
                },
                {
                    where: {
                        id: id,
                    },
                    transaction: transaction, // 传递事务对象
                },
            );
            if (data?.roleId) {
                // 删除原来的用户角色
                await UserRoleModel.destroy({
                    where: {
                        userId: id,
                    },
                    transaction: transaction, // 传递事务对象
                });
                // 通过code查询用户角色
                const role: any = await RoleModel.findOne({
                    where: {
                        id: data.roleId,
                        status: StatusEnum.ENABLE
                    },
                    transaction: transaction, // 传递事务对象
                });
                if (!role) {
                    throw new Error("角色不存在");
                }

                // 添加新的用户角色
                await UserRoleModel.create({
                    userId: id,
                    roleId: data.roleId,
                    createdAt: new Date().getTime(),
                    updatedAt: new Date().getTime(),
                }, {
                    transaction: transaction, // 传递事务对象
                });
            }
            await transaction?.commit();
            return result;
        } catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }
    // 删除数据
    static async deleteUserAndRole(id: any) {
        if (!id) {
            throw new Error("参数错误");
        }
        const transaction = await UserModel?.sequelize?.transaction();
        try {
            const result = await UserModel.destroy({
                where: {
                    id: id,
                },
                transaction: transaction, // 传递事务对象
            });
            // 删除原来的用户角色
            await UserRoleModel.destroy({
                where: {
                    userId: id,
                },
                transaction: transaction, // 传递事务对象
            });
            await transaction?.commit();
            return result;
        } catch (e) {
            await transaction?.rollback();
            const error: any = e;
            throw error;
        }
    }
}

export default UserService;
