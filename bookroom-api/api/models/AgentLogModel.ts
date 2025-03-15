import { DataTypes, Model } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 智能助手-日志-表
class AgentLogModel extends Model {
}
// 初始化model
AgentLogModel.init(
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
        agentId: {
            field: "agent_id",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "请填入智能助手ID"
                }
            },
        },
        // 输入内容
        input: {
            field: "input",
            type: DataTypes.BLOB("long"),
            get() {
                return Buffer.from(this.getDataValue('input')).toString('base64');
            },
            allowNull: false,
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
        tableName: "agent_log",
        // 索引
        indexes: [],
        timestamps: true,
        sequelize: database,
    }
);

export default AgentLogModel;
