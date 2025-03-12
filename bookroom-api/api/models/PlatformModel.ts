import { DataTypes, Model, Op } from "sequelize";
import database from "@/common/database";
import { PLATFORM_RULE, URL_RULE } from "@/common/rule";
import { StatusModelRule } from "./rule";

// 平台-表
class PlatformModel extends Model {
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
PlatformModel.init(
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
        // 平台名称
        name: {
            field: "name",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                is: {
                    args: PLATFORM_RULE.name.RegExp,
                    msg: PLATFORM_RULE.name.message,
                },
                notEmpty: {
                    msg: "请填入平台名称",
                },
            },
        },
        // 接口类型
        code: {
            field: "code",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                is: {
                    args: PLATFORM_RULE.code.RegExp,
                    msg: PLATFORM_RULE.code.message,
                },
                notEmpty: {
                    msg: "请填入接口类型",
                },
            },
        },
        // 平台类型
        type: {
            field: "type",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                is: {
                    args: PLATFORM_RULE.type.RegExp,
                    msg: PLATFORM_RULE.type.message,
                },
                notEmpty: {
                    msg: "请填入平台类型",
                },
            },
        },
        //连接地址
        host: {
            field: "host",
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                is: {
                    args: URL_RULE.ipAndUrl.RegExp,
                    msg: URL_RULE.ipAndUrl.message,
                },
                notEmpty: {
                    msg: "请填入连接地址",
                },
            },
        },
        // 验证密钥
        apiKey: {
            field: "api_key",
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                // notEmpty: {
                //     msg: "请填入验证密钥",
                // },
            },
        },
        // 配置参数
        paramsConfig: {
            field: "params_onfig",
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                // notEmpty: {
                //     msg: "请填入参数配置",
                // },
            },
        },
        // 启用状态：1启用，0禁用
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
        tableName: "platform",
        // 索引
        indexes: [
            {
                // 唯一
                unique: true,
                // 字段集合
                fields: ["name"],
            }
        ],
        timestamps: true,
        sequelize: database,
    }
);

export default PlatformModel;
