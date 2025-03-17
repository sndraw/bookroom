# BookRoom
> 私有化智能图书室
> 
> [https://github.com/sndraw/bookroom](https://github.com/sndraw/bookroom) 


## 项目介绍
> 该项目是一个基于家庭、学校或组织的私有知识库(知识图谱)管理平台，旨在提供一个集中的地方来管理和使用各种智能助手和深度学习模型，以实现知识的自动化和智能化管理。
> 
> 平台支持人工、半自动或完全自动化的方式构建和管理知识库(知识图谱)，以便更好地理解和利用数据。
> 
> 平台支持多种模型，包括自然语言处理、计算机视觉、语音识别等，并提供多平台部署选项，以便在不同的设备和环境中使用。
> 
> 此外，平台还提供了模型问答功能，用户可以通过输入问题来获取模型的回答，从而快速获取所需的知识信息。



## 功能介绍
- ### 模型部署（多平台模型管理、模型问答）
  - [ollama](https://github.com/ollama/ollama)
  - [千问百炼](https://bailian.console.aliyun.com/)
  - [openai](https://github.com/openai/openai-python)

- ### 知识图谱（多知识图谱管理、2D/3D图谱展示、图谱问答）- 功能完善中
  - [LightRAG](https://github.com/HKUDS/LightRAG)
  - [LightRAG_Multi(多图谱空间版本)](https://github.com/sndraw/LightRAG-Multi)

- ### 智能助手（多智能助手管理、自动执行任务）- 功能架构中
  - [OpenManus](https://github.com/mannaandpoem/OpenManus)
  - [OWL](https://github.com/camel-ai/owl)


- ### 用户管理
  - 用户注册和登录管理
  - 权限控制和角色管理

## 使用指南
### 知识图谱添加步骤
> 1. 登录系统
> 2. 进入【系统配置】页面，点击“添加平台”按钮，填写并保存相关信息
> 3. 进入【知识图谱】页面，点击“添加图谱空间”按钮，填写并保存相关信息
> 4. 在图谱空间中上传文档，进行知识提取和图谱构建
> 5. 完成后，系统会自动生成图谱，用户可以查看和管理生成的图谱，并进行相关问答


### 系统配置示例
#### 模型平台-接口类型
> 1. ollama：http://192.168.1.2:11434
> 2. openai：https://dashscope.aliyuncs.com/compatible-mode/v1

#### 知识图谱-接口类型 - 完善中
> 1. LightRAG：http://127.0.0.1:19621
> 2. LightRAG_Multi：http://127.0.0.1:19621

#### 智能助手-接口类型 - 开发中
> 1. MCP SDK: http://192.168.1.2:25230
> 2. Agents SDK: http://192.168.1.2:5173

#### 搜索引擎-接口类型 - 开发中
> 1. Tavily: https://api.tavily.com

#### 语音识别-接口类型 - 完善中
> 1. OpenAI: http://192.168.1.2:25231