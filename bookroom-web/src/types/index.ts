import React from 'react';

// 定义节点操作类型-enum
export enum OperationTypeEnum {
  no = 'no',
  contextmenu = 'contextmenu',
  addLink = 'addLink',
  addNode = 'addNode',
  delete = 'delete',
  edit = 'edit',
  copy = 'copy',
  paste = 'paste',
  cut = 'cut',
  undo = 'undo',
  redo = 'redo',
  export = 'export',
  import = 'import',
  clear = 'clear',
  save = 'save',
  load = 'load',
  share = 'share',
}

export interface OperationObjType {
  type: OperationTypeEnum;
  node?: any;
  link?: any;
  style?: React.CSSProperties;
}
