import { marked } from 'marked';


export const markdownToText = (content: string) => {
    const html = marked(content, { async: false });
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bodyText = doc.body.textContent || '';
    return bodyText;
  };
  // 获取无标签内容
  export const getNoTagsContent = (content: string) => {
    let regex = null;
    let result = content;
    // 删除<search>标签和<think>标签包裹的内容
    regex = /<search>[\s\S]*?<\/search>|<think>[\s\S]*?<\/think>/g;
    result = result.replace(regex, '');
    // 删除<audio>标签和<video>标签包裹的内容
    regex = /<audio>[\s\S]*?<\/audio>|<video>[\s\S]*?<\/video>/g;
    result = result.replace(regex, '');
    return result;
  };
  
  // 处理标签内容
  export const formatMarkDownContent = (content: string, options?: any) => {
    const {
      delimiter = '\n\n',
      startTag = '<search>',
      endTag = '</search>',
      defaulTitle = '回复中...',
      startTitle = '正在深度搜索...',
      endTitle = '已完成深度搜索',
    } = options || {}
    let result = ''; // 结果
    let before = ''; // 前面的内容
    let title = defaulTitle; // 标题
    let search = ''; // 搜索内容
    if (content.includes(startTag) || content.includes(endTag)) {
      let startIndex = 0; // 开始索引
      let endIndex = 0; // 结束索引
      // 临时变量
      let tempResult = content; // 临时结果
      tempResult = tempResult.replace(`${startTag}${delimiter}${endTag}`, '');
      // 处理搜索
      if (tempResult.indexOf(startTag) !== -1) {
        startIndex = tempResult.indexOf(startTag);
        endIndex = tempResult.indexOf(endTag, startIndex);
        before = tempResult.substring(0, startIndex);
        if (endIndex === -1) {
          title = startTitle;
          search = tempResult.substring(startIndex + startTag.length);
          result = '';
        } else {
          title = endTitle;
          // search值为<search>标签内的内容，不包括`<search>`和`</search>`标签
          search = tempResult.substring(startIndex + startTag.length, endIndex);
          // result值为<search>标签外的内容，不包括`<search>`和`</search>`标签
          result = tempResult.substring(endIndex + endTag.length);
        }
      } else {
        result = tempResult;
      }
    } else {
      result = content;
    }
    return {
      before,
      title,
      search,
      result
    }
  }