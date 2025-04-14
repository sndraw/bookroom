import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 对话-表
class AIChatModel extends Model {
    // 校验数据唯一性
    static judgeUnique = async (data: any, id: any = null) => {
        if (!data) {
            return false;
        }
        const addWhereArray: { [x: string]: any; }[] = [];
        const fieldKeys = ["platformId", "model", "chat_type", "userId"];
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
AIChatModel.init(
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
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入标题",
                },
            },
        },
        // 平台ID
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
            allowNull: false,
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
        // 模型参数
        parameters: {
            field: "parameters",
            type: DataTypes.JSON,
            get() {
                const parameters = this.getDataValue('parameters') || "{}";
                return JSON.parse(parameters);
            },
            set(value: any) {
                const str = JSON.stringify(value || {}, null, 2);
                this.setDataValue('parameters', str);
            },
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
        // 提示词
        prompt: {
            field: "prompt",
            type: DataTypes.STRING(1024),
            allowNull: true,
            validate: {
                // notEmpty: {
                //     msg: "请填入提示词",
                // },
            },
        },
        // 消息内容
        messages: {
            field: "messages",
            type: DataTypes.JSON,
            get() {
                const parameters = this.getDataValue('messages') || "{}";
                return JSON.parse(parameters);
            },
            set(value: any) {
                const str = JSON.stringify(value || {}, null, 2);
                this.setDataValue('messages', str);
            },
            validate: {
                // notEmpty: {
                //     msg: "请填入消息内容",
                // },
                isJSON: {
                    msg: "消息列表必须为有效的JSON格式",
                },
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

export default AIChatModel;
