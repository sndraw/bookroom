import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 智能助手-表
class AgentModel extends Model {
    // 校验数据唯一性
    static judgeUnique = async (data: any, id: any = null) => {
        if (!data) {
            return false;
        }
        const andWhereArray: { [x: string]: any; }[] = [];
        const fieldKeys = ["platformId", "name"];
        // 筛选唯一项
        Object.keys(data).forEach((key) => {
            if (data[key] && fieldKeys.includes(key)) {
                andWhereArray.push({
                    [key]: data[key],
                });
            }
        });

        const where: any = {
            [Op.and]: andWhereArray,
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
AgentModel.init(
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
                    msg: "请填入智能助手名称",
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
        // 类型，1默认
        type: {
            field: "type",
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isInt: {
                    msg: "类型必须为数字"
                }
            }
        },
        // 参数parameters
        paramters: {
            field: "paramters",
            type: DataTypes.JSON,
            // get() {
            //     const paramters = this.getDataValue('paramters') || "{}";
            //     console.log(paramters)
            //     return JSON.parse(paramters);
            // },
            set(value: string) {
                const str = JSON.stringify(value || {});
                this.setDataValue('paramters', str);
            },
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入参数",
                },
                isJSON: {
                    msg: "参数必须为有效的JSON格式",
                },
            },
        },
        // 消息内容
        messages: {
            field: "messages",
            type: DataTypes.BLOB("long"),
            get() {
                const messages = Buffer.from(this.getDataValue('messages')).toString('base64');
                return messages ? JSON.parse(messages) : [];
            },
            set(value: string) {
                const str = JSON.stringify(value || []);
                this.setDataValue('messages', Buffer.from(str, 'base64'));
            },
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
        tableName: "agent",
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
                fields: ["platform_id", "name"]
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

export default AgentModel;
