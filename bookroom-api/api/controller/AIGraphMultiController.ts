import { Context } from "koa";
import { resultError, resultSuccess } from "../common/resultFormat";
import BaseController from "./BaseController";
import AIPlatformService from "@/service/AIPlatformService"
import { AI_GRAPH_MODE_ENUM, AI_GRAPH_PLATFORM_MAP, AI_GRAPH_UPLOAD_FILE_TYPE, AI_PLATFORM_TYPE_MAP } from "@/common/ai";
import { responseStream } from "@/utils/streamHelper";
import FormData from "form-data";
import fs from "fs";
import AIChatLogService from "@/service/AIChatLogService";
import LightragAPI from "@/SDK/lightrag";
import { GRAPH_WORKSPACE_RULE } from "@/common/rule";
import path from "path";
import { StatusEnum } from "@/constants/DataMap";


// 多工作空间AI图谱
class AIGraphMultiController extends BaseController {

    static async queryGraphList(ctx: Context) {
        try {
            const graphList = await AIPlatformService.queryActivedRecords({
                type: AI_PLATFORM_TYPE_MAP.graph.value
            });
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: graphList
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询知识图谱列表异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    static async getGraphInfo(ctx: Context) {
        const { graph } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const result = await AIPlatformService.findAIPlatformByIdOrName(graph);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询知识图片信息异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 获取工作空间列表
    static async queryGraphWorkspaceList(ctx: Context) {
        const { graph } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 请求host，获取工作空间列表
            const result: any = await new LightragAPI(graphInfo?.toJSON()).queryGraphWorkspaceList();
            const list = result?.data || [];
            const workspaceList = list?.map((item: any) => {
                const values = { ...item };
                if (item?.mtime) {
                    values.updatedAt = item?.mtime * 1000
                }
                if (item?.birthtime) {
                    values.createdAt = item?.birthtime * 1000
                }
                values.graph = graphInfo?.name;
                values.graphId = graphInfo?.graph;
                values.graphCode = graphInfo?.code
                return values
            })

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: workspaceList
            });
        } catch (e) {
            ctx.logger.error("获取工作空间列表异常", e); // 记录错误日志    
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 获取空间列表详情
    static async getGraphWorkspaceInfo(ctx: Context) {
        const { graph, workspace } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 查询工作空间详情

            // 请求host，获取工作空间详情
            const result: any = await new LightragAPI(graphInfo?.toJSON()).getGraphWorkspaceInfo(workspace);
            const item = result?.data || {}
            const values = { ...item };
            if (item?.mtime) {
                values.updatedAt = item?.mtime * 1000
            }
            if (item?.birthtime) {
                values.createdAt = item?.birthtime * 1000
            }
            values.graph = graphInfo?.name;
            values.graphId = graphInfo?.graph;
            values.graphCode = graphInfo?.code

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: values
            });
        }
        catch (e) {
            ctx.logger.error("获取工作空间详情异常", e); // 记录错误日志    
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 创建工作空间
    static async createGraphWorkspace(ctx: Context) {
        const { graph } = ctx.params;
        const params: any = ctx.request.body;

        ctx.verifyParams({
            name: {
                type: "string",
                required: true,
                format: GRAPH_WORKSPACE_RULE.name.RegExp,
                message: {
                    required: "图谱空间不能为空",
                    format: GRAPH_WORKSPACE_RULE.name.message,
                },
            },
        }, {
            ...params,
        })
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            const params: any = ctx.request.body || {};
            const { name } = params;
            if (!name) {
                throw new Error("图谱空间参数错误");
            }
            // 请求host，创建工作空间
            const result: any = await new LightragAPI(graphInfo?.toJSON()).createGraphWorkspace({
                name
            });
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            ctx.logger.error("创建工作空间异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 修改工作空间
    static async updateGraphWorkspace(ctx: Context) {
        const { graph, workspace } = ctx.params;
        const params: any = ctx.request.body;

        ctx.verifyParams({
            name: {
                type: "string",
                required: true,
                format: GRAPH_WORKSPACE_RULE.name.RegExp,
                message: {
                    required: "图谱空间不能为空",
                    format: GRAPH_WORKSPACE_RULE.name.message,
                },
            },
        }, {
            ...params,
        })
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            const params: any = ctx.request.body || {};
            const { name } = params;
            if (!name) {
                throw new Error("图谱空间参数错误");
            }
            // 请求host，修改工作空间
            const result: any = await new LightragAPI(graphInfo?.toJSON()).updateGraphWorkspace(workspace, {
                name,
            });
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            ctx.logger.error("修改工作空间异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }


    // 删除工作空间
    static async deleteGraphWorkspace(ctx: Context) {
        const { graph, workspace } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 删除工作空间
            const result: any = await new LightragAPI(graphInfo?.toJSON()).deleteGraphWorkspace(workspace);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("删除工作空间异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    static async queryGraphData(ctx: Context) {
        const { graph, workspace, label = "*", max_depth = 99 } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 请求host，获取知识图谱数据
            const result: any = await new LightragAPI(graphInfo?.toJSON()).queryGraphData(label, max_depth, workspace);


            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询知识图谱异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 查询节点
    static async getGraphNode(ctx: Context) {
        const { graph, workspace, node_id } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!node_id) {
                throw new Error("节点ID参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 请求host，获取知识图谱节点信息
            const result: any = await new LightragAPI(graphInfo?.toJSON()).getGraphNode(node_id, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询节点信息异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 添加节点
    static async createGraphNode(ctx: Context) {
        const { graph, workspace } = ctx.params;
        const node_data: any = ctx.request.body || {};

        try {
            const { entity_name, ...data } = node_data;

            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!entity_name) {
                throw new Error("节点ID参数错误");
            }

            if (!data) {
                throw new Error("节点数据参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 请求host，添加节点关系
            const result: any = await new LightragAPI(graphInfo?.toJSON()).createGrapNode({
                entity_name, node_data: data
            }, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });


        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("添加节点关系异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 修改节点信息
    static async updateGraphNode(ctx: Context) {
        const { graph, workspace, node_id } = ctx.params;
        const node_data = ctx.request.body;

        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            if (!node_id) { // 节点ID参数错误
                throw new Error("节点ID参数错误");
            }
            if (!node_data) { // 节点数据参数错误
                throw new Error("节点数据参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 请求host，更新节点
            const result: any = await new LightragAPI(graphInfo?.toJSON()).updateGraphNode(node_id, node_data, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("更新节点异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 删除节点
    static async deleteGraphNode(ctx: Context) {
        const { graph, workspace, node_id } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!node_id) {
                throw new Error("节点ID参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 请求host，删除节点
            const result: any = await new LightragAPI(graphInfo?.toJSON()).deleteGraphNode(node_id, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("删除节点异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 查询节点关系
    static async getGraphLink(ctx: Context) {
        const { graph, workspace, source, target } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!source || !target) {
                throw new Error("节点关系参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 请求host，获取知识图谱数据
            const result: any = await new LightragAPI(graphInfo?.toJSON()).getGraphLink(source, target, workspace);

            const graphLink = result?.data || {}

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: {
                    graph,
                    ...graphLink,
                    source: source,
                    target: target
                }
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询节点异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 添加节点关系
    static async createGraphLink(ctx: Context) {
        const { graph, workspace } = ctx.params;
        const link_data: any = ctx.request.body || {};

        try {
            const { source, target, ...data } = link_data;
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            if (!source || !target) {
                throw new Error("节点关系参数错误");
            }

            if (!data) {
                throw new Error("节点关系数据参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 请求host，添加节点关系
            const result: any = await new LightragAPI(graphInfo?.toJSON()).createGraphLink({
                src_entity_name: source, tgt_entity_name: target, link_data: data
            }, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("添加节点关系异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 修改节点关系
    static async updateGraphLink(ctx: Context) {
        const { graph, workspace, source, target } = ctx.params;
        const link_data = ctx.request.body;

        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }
            if (!source || !target) {
                throw new Error("节点关系参数错误");
            }

            if (!link_data) {
                throw new Error("节点关系数据参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 请求host，更新节点关系
            const result: any = await new LightragAPI(graphInfo?.toJSON()).updateGraphLink(source, target, link_data, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("更新节点关系异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }


    // 删除节点关系
    static async deleteGraphLink(ctx: Context) {
        const { graph, workspace, source, target } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!source || !target) {
                throw new Error("节点关系参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 删除节点关系
            const result: any = await new LightragAPI(graphInfo?.toJSON()).deleteGraphLink(source, target, workspace);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("删除节点关系异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 插入文本
    static async insertText(ctx: Context) {
        const { graph, workspace } = ctx.params;
        let params: any = ctx.request.body || {};
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const { text, split_by_character = "", split_by_character_only = false } = params;

        params = {
            ...params,
            split_by_character,
            split_by_character_only: split_by_character_only === "true" || split_by_character_only === true
        }
        ctx.verifyParams({
            text: {
                type: "string",
                required: true,
                min: 2,
                max: 1024,
                message: {
                    required: "文本不能为空",
                    min: "文本长度不能小于2",
                    max: "文本长度不能超过1024",
                }
            },
            split_by_character: {
                type: "string",
                required: false,
                min: 1,
                max: 10,
                message: {
                    required: "分割字符不能为空",
                    min: "分割字符不能小于1",
                    max: "分割字符不能超过10",
                }
            },
            split_by_character_only: {
                type: "boolean",
                required: false,
                message: {
                    required: "仅分割字符不能为空",
                    type: "仅分割字符类型错误",
                }
            }
        }, {
            ...params
        })


        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!text) {
                throw new Error("文本参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 插入文本到知识图谱
            const result: any = await new LightragAPI(graphInfo?.toJSON()).insertText({
                text,
                split_by_character,
                split_by_character_only

            }, workspace);

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data || ""
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("添加文本异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 插入文件
    static async insertFile(ctx: Context) {
        const { graph, workspace } = ctx.params;
        let params: any = ctx.request.body || {};
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const { split_by_character = "", split_by_character_only = false, description = "" } = params;
        params = {
            ...params,
            split_by_character,
            split_by_character_only: split_by_character_only === "true" || split_by_character_only === true
        }

        ctx.verifyParams({
            split_by_character: {
                type: "string",
                required: false,
                min: 2,
                max: 10,
                message: {
                    required: "分割字符不能为空",
                    min: "分割字符不能小于2",
                    max: "分割字符不能超过10",
                }
            },
            split_by_character_only: {
                type: "boolean",
                required: false,
                message: {
                    required: "仅分割类型不能为空",
                    type: "仅分割字符类型错误",
                }
            },
            description: {
                type: "string",
                required: false,
                min: 2,
                max: 1024,
                message: {
                    required: "摘要不能为空",
                    min: "摘要长度不能小于2",
                    max: "摘要长度不能超过1024",
                }
            },
        }, {
            ...params
        })

        // 确保 file 是单个文件对象而不是数组
        let files: any;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!ctx.request?.files) {
                throw new Error("文件列表为空");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            const fileField = ctx.request?.files?.file || ctx.request?.files?.files;
            if (fileField) {
                if (Array.isArray(fileField)) {
                    files = fileField;
                } else {
                    files = [fileField];
                }
            }

            if (files?.length < 1) {
                throw new Error("文件为空");
            }
            // 循环判定是否支持文件类型、文件是否存在
            for (const file of files) {
                if (!file) {
                    throw new Error("文件为空");
                }
                // 文件名后缀
                const extname = path.extname(file?.originalFilename).toLowerCase();
                // 检查文件类型是否支持
                if (!AI_GRAPH_UPLOAD_FILE_TYPE?.includes(extname) && !AI_GRAPH_UPLOAD_FILE_TYPE?.includes(file?.mimetype)) {
                    throw new Error(`不支持的文件类型: ${file?.originalFilename}`);
                }
                // 检查文件是否存在
                if (!file?.filepath || !fs.existsSync(file?.filepath)) {
                    throw new Error("上传的文件不存在");
                }
            }
            // 创建 FormData 对象
            const formData = new FormData();
            for (const file of files) {
                if (!file?.filepath) {
                    throw new Error("文件为空");
                }
                try {
                    formData.append('files', fs.createReadStream(file?.filepath), file.originalFilename);
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            }

            formData.append('description', description)
            formData.append('split_by_character', split_by_character)
            formData.append('split_by_character_only', String(split_by_character_only))
            // 上传文件到知识图谱
            const result: any = await new LightragAPI(graphInfo?.toJSON()).insertFile(formData, workspace);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data || ""
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("上传文件异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        } finally {
            // 监听接口结束，删除文件
            ctx.res.once("close", () => {
                try {
                    if (files?.length > 0) {
                        const filePaths = files?.map((file: any) => file?.filepath);
                        // 删除原有文件
                        for (const filePath of filePaths) {
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                        }
                    }
                } catch (e) {
                    ctx.logger.error("删除文件异常", e); // 记录错误日志
                }
            });
        }
    }

    // 清空知识图谱
    static async clearGraphData(ctx: Context) {
        const { graph, workspace } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 清空知识图谱数据
            const result: any = await new LightragAPI(graphInfo?.toJSON()).clearGraphData(workspace);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("清空知识图谱异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 获取知识图谱文档列表
    static async queryGraphDocumentList(ctx: Context) {
        const { graph, workspace } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });
            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 获取文档列表
            const result: any = await new LightragAPI(graphInfo?.toJSON()).queryGraphDocumentList(workspace);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("获取知识图谱文档列表异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 获取知识图谱文档列表
    static async getGraphDocument(ctx: Context) {
        const { graph, workspace, document_id } = ctx.params;
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!document_id) {
                throw new Error("文档ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 获取文档信息
            const result: any = await new LightragAPI(graphInfo?.toJSON()).getGraphDocument(document_id, workspace);
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result?.data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("获取知识图谱文档异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 根据文档ID删除知识图谱中的文档
    static async deleteGraphDocument(ctx: Context) {
        const { graph, workspace, document_id } = ctx.params;

        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            if (!document_id) {
                throw new Error("文档ID参数错误");
            }
            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }
            // 删除文档
            const result: any = await new LightragAPI(graphInfo?.toJSON()).deleteGraphDocument(document_id, workspace);
            if (result?.code !== 0 && result?.status !== "success") {
                throw new Error(result?.message);
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: "ok"
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("删除知识图谱文档异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    static async graphChat(ctx: Context) {
        const { graph, workspace } = ctx.params;
        let params: any = ctx.request.body;
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const newParams = {
            graph,
            ...params
        }
        ctx.verifyParams({
            graph: {
                type: "string",
                required: true,
                min: 4,
                max: 40,
                message: {
                    required: "知识图谱ID不能为空",
                    min: "知识图谱ID长度不能小于4",
                    max: "知识图谱长度不能超过40",
                }
            },
            is_stream: {
                type: "boolean",
                required: false,
                default: true,
                message: {
                    required: "是否流式返回不能为空",
                    type: "是否流式返回类型错误"
                }
            },
            mode: {
                type: "string",
                required: true,
                enum: AI_GRAPH_MODE_ENUM,
                message: {
                    required: "模式不能为空",
                    enum: "模式错误"
                }
            },
            query: {
                type: "string",
                required: true,
                message: {
                    required: "查询内容不能为空"
                }
            },
            top_k: {
                type: "number",
                required: false,
                default: 10,
                min: 1,
                max: 60,
                message: {
                    required: "top_k不能为空",
                    type: "top_k类型错误",
                    min: "top_k不能小于5",
                    max: "top_k不能大于60"
                }
            },
            only_need_context: {
                type: "boolean",
                required: false,
                default: false,
                message: {
                    required: "是否仅需要上下文不能为空"
                }
            },
            only_need_prompt: {
                type: "boolean",
                required: false,
                default: false,
                message: {
                    required: "是否仅需要提示不能为空"
                }
            }
        }, {
            ...newParams
        })
        // 查询参数
        let queryParams = {};
        // 回复文本
        let responseText: any = '';
        try {
            if (!graph) {
                throw new Error("图谱ID参数错误");
            }

            // 查询平台
            const graphInfo: any = await AIPlatformService.findAIPlatformByIdOrName(graph, {
                safe: false
            });

            if (!graphInfo) {
                throw new Error("知识图谱不存在");
            }

            // 获取请求参数
            const { query, mode, top_k, is_stream, only_need_context, only_need_prompt } = newParams;
            if (!query) {
                throw new Error("查询参数不能为空");
            }
            queryParams = {
                mode: mode, // 查询模式
                stream: !!is_stream, // 是否流式返回数据
                query: query, // 查询内容
                top_k: top_k,// 限制候选词数量
                only_need_context: only_need_context,
                only_need_prompt: only_need_prompt,
            }

            // 请求host，获取知识图谱数据
            const dataStream = await new LightragAPI(graphInfo?.toJSON()).graphChat(queryParams, workspace)
            if (is_stream) {
                responseText = await responseStream(ctx, dataStream);
                return;
            }
            responseText = dataStream?.response || dataStream || '';
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: responseText
            });

        } catch (e: any) {
            // 异常处理，返回错误信息
            ctx.logger.error("知识图谱对话异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e?.error || e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error || '',
            });
            responseText = error?.message || '';
        } finally {
            ctx.res.once('close', () => {
                // 添加聊天记录到数据库
                AIChatLogService.addAIChatLog({
                    platform: graph,
                    model: workspace + "/" + AI_GRAPH_PLATFORM_MAP.lightrag.value,
                    type: 1,
                    input: JSON.stringify(queryParams), // 将请求参数转换为JSON字符串
                    output: responseText || '', // 确保响应文本不为空字符串
                    userId: ctx?.userId, // 假设ctx中包含用户ID
                    status: StatusEnum.ENABLE
                });
            })
        }
    }
}
export default AIGraphMultiController;