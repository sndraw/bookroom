import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";

// 登录日志-表
class LoginLogModel extends Model {
}
// 初始化model
LoginLogModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            validate: {
                isUUID: 4,
                notEmpty: {
                    msg: "请填入ID",
                },
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // 启用状态：1为成功，-1为失败
        status: {
            field: "status",
            type: DataTypes.INTEGER({
                length: 2
            }),
            allowNull: false,
            defaultValue: 1,
            validate: {
                isIn: StatusModelRule.isIn,
                notEmpty: {
                    msg: "请填入启用状态",
                },
            },
        },
        // 登录尝试次数
        loginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        // 上次尝试时间
        lastAttemptTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        // 创建时间
        createdAt: {
            field: "created_time",
            type: DataTypes.DATE,
            allowNull: false
        },
        // 更新时间
        updatedAt: {
            field: "updated_time",
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: "login_log",
        // 索引
        indexes: [
            {
                // 唯一
                unique: true,
                // 字段集合
                fields: ["id"],
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

export default LoginLogModel;
