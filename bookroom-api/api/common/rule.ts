export const ROLE_RULE = {
  name: {
    RegExp: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_\-]{1,29}$/,
    message:
      '角色名称应以中文或字母开头，由中文、字母、数字、下划线、连字符组成，长度在2到30个字符之间',
  },
  code: {
    RegExp: /^[a-zA-Z][a-zA-Z0-9_\-]{1,29}$/,
    message:
      '角色标识应以字母开头，由字母、数字、下划线、连字符组成，长度在2到30个字符之间',
  },
};

export const USER_RULE = {
  username: {
    RegExp: /^[a-zA-Z][a-zA-Z0-9_\-]{2,29}$/,
    message:
      '用户名应以字母开头，由字母、数字、下划线、连字符组成，长度在3到30个字符之间',
  },
  password: {
    RegExp: /^[a-zA-Z0-9\W_]{6,20}$/,
    message: '密码由字母、数字或者特殊字符组成，长度6-20个字符',
  },
  email: {
    RegExp: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/,
    message: '邮箱格式不正确'
  }
};

export const PLATFORM_RULE = {
  name: {
    RegExp: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_\-]{1,29}$/,
    message:
      '接口名称应以中文或字母开头，由中文、字母、数字、下划线、连字符组成，长度在2到30个字符之间',
  },
  code: {
    RegExp: /^[a-zA-Z][a-zA-Z0-9_\-]{1,29}$/,
    message:
      '接口类型应以字母开头，由字母、数字、下划线、连字符组成，长度在2到30个字符之间',
  },
  type: {
    RegExp: /^[a-zA-Z][a-zA-Z0-9_\-]{1,29}$/,
    message:
      '配置类型应以字母开头，由字母、数字、下划线、连字符组成，长度在2到30个字符之间',
  },
};

export const URL_RULE = {
  ipAndUrl: {
    RegExp:
      /^(https?:\/\/([a-zA-Z0-9._-]+(:\d+)?|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:\d+)?)(\/[^\s]*)?)$/,
    message: '请输入正确的IP地址或域名',
  },
};

export const GRAPH_WORKSPACE_RULE = {
  name: {
    RegExp: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_\-]{1,19}$/,
    message:
      '图谱空间应以中文或字母开头，由中文、字母、数字、下划线、连字符组成，且长度在2到20个字符之间',
  },
};


export const LLM_RULE = {
  name: {
    RegExp: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_\-\:\\]{1,29}$/,
    message:
      '模型名称应以字母开头，由字母、数字、下划线、连字符、冒号、反斜杠组成，长度在2到30个字符之间',
  },
  model: {
    RegExp: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_\-\:\\]{1,29}$/,
    message:
      '模型标识应以字母开头，由字母、数字、下划线、连字符组成、反斜杠，长度在2到30个字符之间',
  }
}