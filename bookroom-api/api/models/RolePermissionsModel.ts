import { DataTypes, Model } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 用户表
class RolePermissionsModel extends Model { }
// 初始化model
RolePermissionsModel.init(
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
        roleId: {
            field: "role_id",
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                isUUID: 4,
                notEmpty: {
                    msg: "请填入角色ID",
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
        tableName: "role_permissions",
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
                fields: ["role_id", "permission_id"]
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

// 同步模型到数据库
// RolePermissionsModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default RolePermissionsModel;
