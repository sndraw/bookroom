import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";
// 文件日志-表
class FileLog extends Model {
}
// 初始化model
FileLog.init(
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
        // 文件名称
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入名称",
                },
            },
        },
        // 文件名称
        objectId: {
            field: "object_id",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入对象ID",
                },
            },
        },
        // 文件路径
        path: {
            field: "path",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入文件路径",
                },
            },
        },
        // 文件大小
        size: {
            field: "size",
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                isInt: true,
            },
        },
        // 文件类型
        mimetype: {
            field: "mimetype",
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        // 用户ID
        userId: {
            field: "user_id",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入用户ID",
                },
            },
        },
        // 启用状态，1启用，-1禁用
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
        tableName: "file_log",
        // 索引
        indexes: [],
        timestamps: true,
        sequelize: database,
    }
);

export default FileLog;
