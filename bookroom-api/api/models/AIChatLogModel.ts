import { DataTypes, Model } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 对话日志-表
class AIChatLogModel extends Model {
}
// 初始化model
AIChatLogModel.init(
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
        // 平台
        platformId: {
            field: "platform_id",
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入平台ID",
                },
            },
        },
        // 模型
        model: {
            field: "model",
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                notEmpty: {
                    msg: "请填入模型",
                },
            },
        },
        // 对话类型
        chat_type: {
            field: "chat_type",
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 1,
            validate: {
                notEmpty: {
                    msg: "请填入对话类型",
                },
            }
        },
        chat_id: {
            field: "chat_id",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty:{
                    msg:"请填入对话ID"
                }
            },
        },
        // 输入内容
        input: {
            field: "input",
            type: DataTypes.BLOB("long"),
            allowNull: false,
            get() {
                return Buffer.from(this.getDataValue('input')).toString('base64');
            },
            validate: {
                notEmpty: {
                    msg: "请填入输入内容",
                },
            },
        },
        // 输出内容
        output: {
            field: "output",
            type: DataTypes.BLOB("long"),
            allowNull: true,
            get() {
                return Buffer.from(this.getDataValue('output')).toString('base64');
            },
            validate: {
                // notEmpty: {
                //     msg: "请填入输出内容",
                // },
            },
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
        tableName: "ai_chat_log",
        // 索引
        indexes: [],
        timestamps: true,
        sequelize: database,
    }
);

export default AIChatLogModel;
