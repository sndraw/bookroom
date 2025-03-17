import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 模型详情-表
class AILmModel extends Model {
}
// 初始化model
AILmModel.init(
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
        // 模型平台
        platformId: {
            field: "platform_id",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入模型平台",
                },
            },
        },
        // 模型名称
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入模型名称",
                },
            },
        },
        // 模型标识
        model: {
            field: "model",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入模型标识",
                },
            },
        },
        // 模型类型
        type: {
            field: "type",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入模型类型",
                },
            },
        },
        // 模型大小
        size: {
            field: "size",
            type: DataTypes.INTEGER({
                length: 20
            }),
            allowNull: true,
            validate: {
                notEmpty: {
                    msg: "请填入模型大小",
                },
            },
        },
        // 配置参数
        parameters: {
            field: "params_onfig",
            type: DataTypes.JSON,
            allowNull: true,
            get() {
                const parameters = this.getDataValue('params_onfig') || "{}";
                return JSON.parse(parameters);
            },
            set(value: string) {
                const str = JSON.stringify(value || {}, null, 2);
                this.setDataValue('params_onfig', str);
            },
            validate: {
                // notEmpty: {
                //     msg: "请填入参数配置",
                // },
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
        tableName: "ai_lm",
        // 索引
        indexes: [
            {
                // 唯一
                unique: true,
                // 字段集合
                fields: ["name", "platform_id"],
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

export default AILmModel;
