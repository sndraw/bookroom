import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { StatusModelRule } from "./rule";
// 大模型-详情表
class LlmModel extends Model {
    // 校验数据唯一性
    static judgeUnique = async (data: any, id: any = null) => {
        if (!data) {
            return false;
        }
        const andWhereArray: { [x: string]: any; }[] = [];
        const fieldKeys = ["name", "platformId"];
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
LlmModel.init(
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
        // 模型分类
        type: {
            field: "type",
            type: DataTypes.STRING(255),
            allowNull: false,
            get() {
                return this.getDataValue('type').split(",")
            },
            set(value:string | string[]) {
                // 如果是数组则将数组转换为字符串
                if (Array.isArray(value)) {
                    value = value.join(",");
                }
                this.setDataValue('type', value);
            },
            validate: {
                notEmpty: {
                    msg: "请填入模型分类",
                },
            },
        },
        // 配置参数
        parameters: {
            field: "parameters",
            type: DataTypes.JSON,
            allowNull: true,
            get() {
                const parameters = this.getDataValue('parameters') || "{}";
                return JSON.parse(parameters);
            },
            set(value: string) {
                const str = JSON.stringify(value || {}, null, 2);
                this.setDataValue('parameters', str);
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
        tableName: "llm",
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

export default LlmModel;
