/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AIGraphInfo {
    id?: string;
    name: string;
    code: string;
    host?: string;
    status: number;
    createTime?: string;
    updateTime?: string;
  }

  interface Result_AIGraphInfo_ {
    code?: number;
    message?: string;
    data?: AIGraphInfo;
  }

  interface Result_AIGraphInfoList_ {
    code?: number;
    message?: string;
    data?: AIGraphInfo[];
  }

  interface AIGraphWorkspaceInfo {
    id?: string;
    name: string;
    graph: string;
    graphId: string;
    graphCode: string;
    graphHost: string;
    workspace: string;
    createdAt?: string;
    updatedAt?: string;
  }
  interface AIGraphWorkspaceInfoVO {
    name: string;
  }

  interface Result_AIGraphWorkspaceInfo_ {
    code?: number;
    message?: string;
    data?: AIGraphWorkspaceInfo;
  }

  interface Result_AIGraphWorkspaceList_ {
    code?: number;
    message?: string;
    data?: AIGraphWorkspaceInfo[];
  }
  interface PageInfo_AIGraphWorkspaceInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: AIGraphWorkspaceInfo[];
  }

  interface Result_PageInfo_AIGraphWorkspaceInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_AIGraphWorkspaceInfo_;
  }

  interface AIGraphNode {
    id: string;
    label: string;
    entity_type: string;
    description: string;
    source_id: string;
  }
  interface AIGraphNodeVO {
    id?: string;
    label?: string;
    entity_name?: string;
    entity_type: string;
    description: string;
    source_id: string;
  }

  interface AIGraphLink {
    id: string;
    source: string;
    target: string;
    weight: number;
    keywords: string;
    description: string;
    source_id: string;
  }

  interface AIGraphLinkVO {
    id?: string;
    source?: any;
    target?: any;
    weight?: number;
    keywords?: string;
    description?: string;
    source_id?: string;
  }

  interface AIGraphData {
    nodes: AIGraphNode[];
    edges: AIGraphLink[];
  }
  interface Result_AIGraphNode_ {
    code?: number;
    message?: string;
    data?: AIGraphNode;
  }
  interface Result_AIGraphLink_ {
    code?: number;
    message?: string;
    data?: AIGraphLInk;
  }

  interface Result_AIGraphData_ {
    code?: number;
    message?: string;
    data?: AIGraphData;
  }
}
