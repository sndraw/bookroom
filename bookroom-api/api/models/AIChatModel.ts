import { DataTypes, Model, Op } from "sequelize";
import database from "../common/database";
import { StatusEnum } from "@/constants/DataMap";
import { StatusModelRule } from "./rule";
// 模型详情-表
class AIChatLog extends Model {
}
// 初始化model
AIChatLog.init(
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
        title:{
            field: "title",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入标题",
                },
            },
        },
        // 平台
        platform: {
            field: "platform",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入平台",
                },
            },
        },
        // 模型
        model: {
            field: "model",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入模型",
                },
            },
        },
        // 日志类型，1对话，2图片，3语音，4视频
        type: {
            field: "type",
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isIn: {
                    args: [[1, 2, 3, 4]],
                    msg: "日志类型必须为1,2,3,4其中之一",
                },
            }
        },
        // 模型参数
        paramters: {
            field: "paramters",
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入模型参数",
                },
                isJSON: {
                    msg: "模型参数必须为有效的JSON格式",
                },
            },
        },
        // 消息内容
        messages: {
            field: "messages",
            type: DataTypes.BLOB("long"),
            allowNull: true,
            validate: {
                // notEmpty: {
                //     msg: "请填入消息内容",
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
        tableName: "ai_chat",
        // 索引
        indexes: [],
        timestamps: true,
        sequelize: database,
    }
);

export default AIChatLog;
