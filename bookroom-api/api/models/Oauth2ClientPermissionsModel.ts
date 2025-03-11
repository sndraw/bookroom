import { DataTypes, Model } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";
// Oauth2-客户系统-权限关联表
class Oauth2ClientPermissionsModel extends Model { }
// 初始化model
Oauth2ClientPermissionsModel.init(
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
        clientId: {
            field: "client_id",
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                isUUID: 4,
                notEmpty: {
                    msg: "请填入客户系统ID",
                },
            },
        },
        permissionId: {
            field: "permission_id",
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                isUUID: 4,
                notEmpty: {
                    msg: "请填入权限ID",
                },
            },
        },
        // 启用状态：1为启用，-1为禁用
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
        tableName: "oauth2_client_permissions",
        // 索引
        indexes: [
            {
                // 唯一
                unique: true,
                // 字段集合
                fields: ["id"],
            },
            {
                // 唯一
                unique: true,
                // 字段集合
                fields: ["client_id", "permission_id"]
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

// 同步模型到数据库
// Oauth2ClientPermissionsModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default Oauth2ClientPermissionsModel;
