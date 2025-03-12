import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";

// 权限表
class Oauth2PermissionModel extends Model {
    // 校验数据唯一性
    static judgeUnique = async (data: any, id: any = null) => {
        if (!data) {
            return false;
        }
        const addWhereArray: { [x: string]: any; }[] = [];
        const fieldKeys = ["name"];
        // 筛选唯一项
        Object.keys(data).forEach((key) => {
            if (data[key] && fieldKeys.includes(key)) {
                addWhereArray.push({
                    [key]: data[key],
                });
            }
        });
        const where: any = {
            [Op.and]: addWhereArray,
        };
        // 如果有id参数，则为数据更新操作
        if (id) {
            where.id = { [Op.not]: id };
        }
        const count = await super.count({
            where,
        });
        return !count;
    };
}
// 初始化model
Oauth2PermissionModel.init(
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
        // 权限名称
        name: {
            field: "name",
            type: DataTypes.STRING(64),
            allowNull: false,
            validate: {
                is: ["^[\u4e00-\u9fa5a-zA-Z0-9]+$", "i"],
                len: [1, 64],
                notEmpty: {
                    msg: "请填入权限名称",
                },
            },
        },
        // 权限配置
        config: {
            field: "config",
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isJSON: true,
                notEmpty: {
                    msg: "请填入权限配置",
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
        tableName: "oauth2_permission",
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
                fields: ["name"]
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

// 同步模型到数据库
// Oauth2PermissionModel.sync({ force: process.env.DB_SYNC ? Boolean(process.env.DB_SYNC) : false });
export default Oauth2PermissionModel;
