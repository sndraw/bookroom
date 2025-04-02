import { LoadingOutlined } from '@ant-design/icons';
import { marked } from 'marked';
import Papa from 'papaparse';
import { useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

import styles from './index.less'; // 引入外部样式表

export const markdownToText = (content: string) => {
  const html = marked(content, { async: false });
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const bodyText = doc.body.textContent || '';
  return bodyText;
};

export const formatMarkDownContent = (markdownContent: string): any => {
  if (!markdownContent) return null;

  // 将 `markdownContent` 中的 `<think>` 标签替换为相应的 Markdown 格式
  // 如果只有标签 `<think>`没有结尾</think>，则将及后续内容替换为“正在深度思考”标签
  let title = '回复中...';
  let search = '';
  let think = '';
  let result = '';
  result = markdownContent.replace('<think>\n\n</think>', '');
  result = result.replace('<search>\n\n</search>', '');
  // 处理搜索
  if (result.indexOf('<search>') !== -1) {
    const startIndex = result.indexOf('<search>');
    const endIndex = result.indexOf('</search>', startIndex);
    if (endIndex === -1) {
      title = '正在深度搜索...';
      search = result.substring(startIndex + '<search>'.length);
      result = '';
    } else {
      title = '已完成深度搜索';
      // search值为<search>标签内的内容，不包括`<search>`和`</search>`标签
      search = result.substring(startIndex + '<search>'.length, endIndex);
      // result值为<search>标签外的内容，不包括`<search>`和`</search>`标签
      result = result.substring(endIndex + '</search>'.length);
    }
  }
  // 处理深度思考
  if (result.indexOf('<think>') !== -1) {
    const startIndex = result.indexOf('<think>');
    const endIndex = result.indexOf('</think>', startIndex);
    if (endIndex === -1) {
      title = '正在深度思考...';
      // think值为<think>标签内的内容，不包括`<think>`和`</think>`标签
      think = result.substring(startIndex + '<think>'.length);
      result = '';
    } else {
      title = '已完成深度思考';
      // think值为<think>标签内的内容，不包括`<think>`和`</think>`标签
      think = result.substring(startIndex + '<think>'.length, endIndex);
      // result值为<think>标签外的内容，不包括`<think>`和`</think>`标签
      result = result.substring(endIndex + '</think>'.length);
    }
  }
  return {
    title,
    search,
    think,
    result,
  };
};

export const MarkdownWithHighlighting = ({
  markdownContent,
}: {
  markdownContent: string;
}) => {
  const CodeRnderer = ({
    node,
    inline,
    className,
    children,
    ...props
  }: any) => {
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

  // 格式化内容
  const content = useMemo(() => {
    return formatMarkDownContent(markdownContent) as any;
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
    [content],
  );

  if ((!content?.title || (!content?.think && !content?.search)) && !content?.result) {
    return (
      <div className={styles.loadingWrapper}>
        <LoadingOutlined style={{ marginRight: '5px' }} />
        <span className={styles?.loadingTitle}>
          {content?.title || '加载中...'}
        </span>
      </div>
    );
  }
  return (
    <>
      {content?.title && content?.search && (
        <TitleWrapper
          title={content?.title}
          content={content?.search}
          done={!!content?.result}
        ></TitleWrapper>
      )}
      {content?.title && content?.think && (
        <TitleWrapper
          title={content?.title}
          content={content?.think}
          done={!!content?.result}
        ></TitleWrapper>
      )}

      {content?.result && (
        <ReactMarkdown
          components={{
            code: CodeRnderer,
          }}
        >
          {content?.result}
        </ReactMarkdown>
      )}
    </>
  );
};
