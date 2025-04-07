import { LoadingOutlined } from '@ant-design/icons';
import { marked } from 'marked';
import Papa from 'papaparse';
import { useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

import styles from './index.less'; // 引入外部样式表
import { previewFileApi } from '@/services/common/file';
import MediaPreview from '../MediaPreview';
import { isMediaObjectId } from '@/utils/file';

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

export const getPreviewUrl = async (file: string) => {
  // 获取图片的base64编码
  const res = await previewFileApi({
    fileId: file,
  });
  return res?.url;
}

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

export const CodeRenderer = (params: any) => {
  const { node, inline, className, children, ...props } = params || {};

  const match = /language-(\w+)/.exec(className || '');
  const isInline = typeof children === 'string' && !children.includes('\n');
  if (match && match[1] === 'csv') {
    if (!children) {
      return null;
    }
    const csvData = String(children).replace(/\n$/, '');
    const parsedData = Papa.parse(csvData, { header: true }).data as Array<{
      [key: string]: unknown;
    }>;

    return (
      <table
        border={1}
        cellPadding={5}
        cellSpacing={0}
        className={styles?.table}
      >
        <thead>
          <tr>
            {Object.keys(parsedData[0]).map((header) => (
              <th key={header} className={styles?.tableCell}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex} className={styles?.tableTdCell}>
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return !isInline && match ? (
    <SyntaxHighlighter style={okaidia} language={match[1]} PreTag="div">
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
export const MediaRenderer =  (params: any) => {
  const { children, ...props } = params || {};

  // 判定是否为媒体对象
  if (isMediaObjectId(props.href)) {
    return <MediaPreview href={props.href} />;
  }
  // 使用组件正常的渲染逻辑
  return <a {...props} >{children}</a>
};

export const MarkdownWithHighlighting = ({
  markdownContent,
}: {
  markdownContent: string;
}) => {
  // 内容列表
  const contentList = useMemo(() => {
    const list: any[] = [];

    let result = markdownContent;
    const hasSearchOrThinkTags = (str?: string): boolean => {
      const searchRegex = /<search>|<\/search>|<think>|<\/think>/g;
      return searchRegex.test(str || '');
    };
    while (result && hasSearchOrThinkTags(result)) {
      // 存储原内容，用于对比，防止无限循环
      const prevResult = result;
      // 定义格式化内容对象
      let formatedObj: any = null;
      // 如果有<search>或<think>标签，则进行处理
      // <search>或<think>标签的处理逻辑，哪个标签先处理哪个标签
      const firstSearchIndex = result.indexOf('<search>');
      const firstThinkIndex = result.indexOf('<think>');
      if (firstSearchIndex !== -1 && firstThinkIndex !== -1) {
        if (firstSearchIndex < firstThinkIndex) {
          formatedObj = formatMarkDownContent(result, {
            startTag: '<search>',
            endTag: '</search>',
            startTitle: '正在深度搜索...',
            endTitle: '已完成深度搜索',
          });

        }
        if (firstSearchIndex > firstThinkIndex) {
          formatedObj = formatMarkDownContent(result, {
            startTag: '<think>',
            endTag: '</think>',
            startTitle: '正在深度思考...',
            endTitle: '已完成深度思考',
          });
        }
      }
      if (firstSearchIndex !== -1 && firstThinkIndex === -1) {
        formatedObj = formatMarkDownContent(result, {
          startTag: '<search>',
          endTag: '</search>',
          startTitle: '正在深度搜索...',
          endTitle: '已完成深度搜索',
        });
      }
      if (firstSearchIndex === -1 && firstThinkIndex !== -1) {
        formatedObj = formatMarkDownContent(result, {
          startTag: '<think>',
          endTag: '</think>',
          startTitle: '正在深度思考...',
          endTitle: '已完成深度思考',
        });
      }
      // 如果formatedObj不为空，且有搜索结果
      if (formatedObj && formatedObj?.search) {
        list.push({
          before: formatedObj?.before,
          title: formatedObj?.title,
          search: formatedObj?.search,
          done: !!formatedObj?.result,
        });
        result = formatedObj?.result || ''
      } else {
        result = formatedObj?.result || ''
      }
      // 如果内容一致，表明内部逻辑出问题
      if (result === prevResult) {
        break;
      }
    }
    list.push({
      result
    })
    return list;
  }, [markdownContent]);

  const TitleWrapper = useCallback(
    ({
      title,
      content,
      done,
    }: {
      title: string;
      content?: string;
      done?: boolean;
    }) => {
      return (
        <details className={styles.titleWrapper} open={!done}>
          <summary className={styles.titleSummary}>{title}</summary>
          {content && (
            <ReactMarkdown className={styles.titleContent}>
              {content}
            </ReactMarkdown>
          )}
        </details>
      );
    },
    [contentList],
  );
  if (!contentList || !contentList.length || (contentList.length === 1 && !contentList[0].result)) {
    return (
      <div className={styles.loadingWrapper}>
        <LoadingOutlined style={{ marginRight: '5px' }} />
        <span className={styles?.loadingTitle}>
          {'加载中...'}
        </span>
      </div>
    );
  }
  return (
    <>
      {
        contentList?.map((item, index) => {
          if (!item) return null;
          return (
            <div key={index}>
              {item?.before && (
                <ReactMarkdown
                  key={index + "before"}
                  components={{
                    code: CodeRenderer,
                    a: MediaRenderer,
                  }}
                >
                  {item?.before}
                </ReactMarkdown>
              )}
              {item?.title && item?.search && (
                <TitleWrapper
                  key={index + "title"}
                  title={item?.title}
                  content={item?.search}
                  done={item?.done}
                ></TitleWrapper>
              )}
              {item?.result && (
                <ReactMarkdown
                  key={index + "result"}
                  components={{
                    code: CodeRenderer,
                    a: MediaRenderer,
                  }}
                >
                  {item?.result}
                </ReactMarkdown>
              )}
            </div>
          )
        })
      }
    </>
  );
};
