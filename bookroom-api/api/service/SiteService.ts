import { StatusEnum } from "@/constants/DataMap";
import SiteModel from "../models/SiteModel";
import { Identifier, Op } from "sequelize";
import { getOrderArray } from "@/utils/query";
class SiteService {
    // 获取列表
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { current, pageSize, sorter } = params;
        const { status, startDate, endDate } = params;
        current = current ? Number.parseInt(current) : 1;
        pageSize = pageSize ? Number.parseInt(pageSize) : 10;
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

        const result = await SiteModel.findAndCountAll({
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

    // 查询单条数据-ById
    static async findRecordById(id: Identifier | undefined) {
        if (!id) {
            throw new Error("参数错误");
        }
        const result = await SiteModel.findByPk(id);
        return result;
    }

    // 查询单条数据-BySetup
    static async findRecordBySetup() {
        const result = await SiteModel.findOne({
            where: {
                setup: StatusEnum.ENABLE
            },
        });
        return result;
    }

    // 添加数据
    static async addRecord(data: any) {
        if (!data) {
            throw new Error("参数错误");
        }
        const transaction = await SiteModel?.sequelize?.transaction();
        try {
            const result = await SiteModel.create({
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
        const transaction = await SiteModel?.sequelize?.transaction();
        try {
            const result = await SiteModel.update(
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
        const transaction = await SiteModel?.sequelize?.transaction();
        try {
            const result = await SiteModel.destroy({
                where: {
                    id: id,
                },
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


}

export default SiteService;
