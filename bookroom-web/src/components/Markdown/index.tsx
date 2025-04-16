import { LoadingOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm'
import rehypeReact from 'rehype-react'
import remarkMath from 'remark-math'
import MediaPreview from '../MediaPreview';
import { isMediaObjectId } from '@/utils/file';
import DotChart, { isValidGraphDotCode } from './DotChart';
import { formatMarkDownContent, formatUsageTag } from './utils';
import MermaidChart, { isValidGraphMermaidCode } from './MermaidChart';
import styles from './index.less'; // 引入外部样式表

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
  if (match && match[1] === 'dot' && isValidGraphDotCode(children)) {
    const chartCode = children as string;
    return (
      <DotChart chart={{ code: chartCode }} />
    );
  }

  if (match && match[1] === 'mermaid' && isValidGraphMermaidCode(children)) {
    const chartCode = children as string;
    return (
      <MermaidChart chart={{ code: chartCode }} />
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
export const MediaRenderer = (params: any) => {
  const { children, ...props } = params || {};

  // 判定是否为媒体对象
  if (isMediaObjectId(props.href)) {
    return <MediaPreview className={styles.mediaPreview} href={props.href} />;
  }
  // 使用组件正常的渲染逻辑
  return <a {...props} target='_blank' rel='noopener noreferrer'>{children}</a>
};
// 转换消息文档为字符串
export const formatMessageContent = (msgContent: any) => {
  let content = "";
  // 如果content是字符串
  if (typeof msgContent === "string") {
    content = msgContent;
  }
  // 如果content是数组类型
  if (Array.isArray(msgContent)) {
    msgContent.forEach((item, index) => {
      try {
        if (index) {
          content += "\n"
        }
        // 如果item是字符串
        if (typeof item === "string") {
          content += item;
          return;
        }
        // 如果是type类型是文本类型
        if (item?.type === "text") {
          content += item?.text;
          return;
        }
        content += JSON.stringify(item);
      } catch (e) {
        console.log(e);
      }
    });
  }
  return content
}

const SEARCH_TAG_CONFIG = {
  startTag: '<search>',
  endTag: '</search>',
  startTitle: '正在深度搜索...',
  endTitle: '已完成深度搜索',
}

const THINK_TAG_CONFIG = {
  startTag: '<think>',
  endTag: '</think>',
  startTitle: '正在深度思考...',
  endTitle: '已完成深度思考',
};

export const MarkdownWithHighlighting = ({
  markdownContent,
}: {
  markdownContent: any;
}) => {
  // 内容列表
  const contentList = useMemo(() => {
    const list: any[] = [];
    let result = formatMessageContent(markdownContent);
    // 格式化usage标签
    result = formatUsageTag(result);
    // 检查是否有搜索或思考标签
    const hasSearchOrThinkTags = (str?: string): boolean => {
      const searchRegex = /<search>|<\/search>|<think>|<\/think>/g;
      return searchRegex.test(str || '');
    };
    // 处理搜索和思考标签
    while (result && hasSearchOrThinkTags(result)) {
      const prevResult = result;
      
      // 确定要处理的第一个标签类型
      const searchStart = result.indexOf('<search>');
      const thinkStart = result.indexOf('<think>');
      
      let config: any = null;
    
      if (searchStart !== -1 && thinkStart !== -1) {
        config = searchStart < thinkStart ? SEARCH_TAG_CONFIG : THINK_TAG_CONFIG;
      } else if (searchStart !== -1) {
        config = SEARCH_TAG_CONFIG;
      } else if (thinkStart !== -1) {
        config = THINK_TAG_CONFIG;
      }
    
      // 处理无起始标签的情况
      if (!config && (/<\/search>|<\/think>/).test(result)) {
        const searchEndMatch = result.match(/<\/search>/);
        const thinkEndMatch = result.match(/<\/think>/);
        
        config = searchEndMatch ? SEARCH_TAG_CONFIG : 
                 thinkEndMatch ? THINK_TAG_CONFIG : null;
      }
    
      if (config) {
        const formattedResult = formatMarkDownContent(result, config);
        
        if (formattedResult.search) {
          list.push({
            before: formattedResult.before,
            title: formattedResult.title,
            search: formattedResult.search,
            done: !!formattedResult?.result,
          });
          result = formattedResult.result || '';
        } else {
          result = formattedResult.result || '';
        }
      }
    
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
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeReact]}
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
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeReact]}
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
