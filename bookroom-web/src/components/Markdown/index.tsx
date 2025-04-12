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

export const MarkdownWithHighlighting = ({
  markdownContent,
}: {
  markdownContent: string;
}) => {
  // 内容列表
  const contentList = useMemo(() => {
    const list: any[] = [];

    let result = markdownContent;
    // 格式化usage标签
    result = formatUsageTag(result);
    // 检查是否有搜索或思考标签
    const hasSearchOrThinkTags = (str?: string): boolean => {
      const searchRegex = /<search>|<\/search>|<think>|<\/think>/g;
      return searchRegex.test(str || '');
    };
    // 处理搜索和思考标签
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
