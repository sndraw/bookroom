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
// 获取无标签内容
export const getNoTagsContent = (content: string) => {
  // 删除<search>标签和<think>标签包裹的内容
  const regex = /<search>[\s\S]*?<\/search>|<think>[\s\S]*?<\/think>/g;
  return content.replace(regex, '');
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

  // 内容列表
  const contentList = useMemo(() => {
    const list: any[] = [];
    let remainingContent = markdownContent;
    const tagRegex = /(<search>|<think>)/g; // Regex to find the start of either tag

    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(remainingContent)) !== null) {
      const tagStartIndex = match.index;
      const tagType = match[1] === '<search>' ? 'search' : 'think';
      const startTag = match[1];
      const endTag = `</${tagType}>`;
      const tagEndIndex = remainingContent.indexOf(endTag, tagStartIndex);

      // Push content before the tag (if any)
      if (tagStartIndex > 0) {
        list.push({ type: 'markdown', content: remainingContent.substring(0, tagStartIndex) });
      }

      if (tagEndIndex !== -1) {
        // Found a complete tag block
        const tagContent = remainingContent.substring(tagStartIndex + startTag.length, tagEndIndex);
        const afterTagIndex = tagEndIndex + endTag.length;
        const isDone = !!remainingContent.substring(afterTagIndex).trim(); // Check if content exists after tag
        
        // Determine titles based on tag type
        const startTitle = tagType === 'search' ? '正在深度搜索...' : '正在深度思考...';
        const endTitle = tagType === 'search' ? '已完成深度搜索' : '已完成深度思考';
        
        list.push({
          type: tagType,
          title: isDone ? endTitle : startTitle, // Title depends on whether it's considered 'done'
          tagContent: tagContent,
          done: isDone,
        });
        remainingContent = remainingContent.substring(afterTagIndex);
        tagRegex.lastIndex = 0; // Reset regex index after slicing the string
      } else {
        // Found start tag but no end tag - treat rest as part of the 'in-progress' tag
        const tagContent = remainingContent.substring(tagStartIndex + startTag.length);
        const startTitle = tagType === 'search' ? '正在深度搜索...' : '正在深度思考...';
        list.push({
          type: tagType,
          title: startTitle,
          tagContent: tagContent,
          done: false, // Not done as end tag is missing
        });
        remainingContent = ''; // No more content left
        break; // Exit loop
      }
    }

    // Push any remaining content after the last tag
    if (remainingContent) {
      list.push({ type: 'markdown', content: remainingContent });
    }

    return list;
  }, [markdownContent]);

  const TitleWrapper = useCallback(({ title, content, done }: { title: string; content?: string; done?: boolean }) => {
      // Minimal change: Default 'open' state should be !done (true if not done, false if done)
      return (
        <details className={styles.titleWrapper} open={!done}>
          <summary className={styles.titleSummary}>{title}</summary>
          {content && (
            <ReactMarkdown 
              className={styles.titleContent}
              components={{
                  code: CodeRnderer,
              }}
             >
              {content}
            </ReactMarkdown>
          )}
        </details>
      );
    }, [CodeRnderer]);

  if (!markdownContent && markdownContent !== "") {
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
    <div>
      {contentList?.map((item, index) => {
        if (!item) return null;
        // Render based on the type determined during parsing
        if (item.type === 'search' || item.type === 'think') {
          return (
            <TitleWrapper
              key={`${item.type}-${index}`}
              title={item.title}
              content={item.tagContent}
              done={item.done}
            />
          );
        } else if (item.type === 'markdown') {
          return (
            <ReactMarkdown
              key={`markdown-${index}`}
              components={{
                code: CodeRnderer,
              }}
            >
              {item.content}
            </ReactMarkdown>
          );
        } else {
            // Fallback for any unexpected item structure (e.g., old format)
             if (item?.result) { // Check if it resembles the old structure
                return (
                    <ReactMarkdown
                    key={`fallback-result-${index}`}
                    components={{ code: CodeRnderer }}
                    >
                    {item.result}
                    </ReactMarkdown>
                );
             } else if (item?.before || item?.search || item?.tagContent) { // Old structure with before/search/tagContent
                 return (
                     <div key={`fallback-old-${index}`}>
                         {item?.before && <ReactMarkdown key={index + "before"} components={{ code: CodeRnderer }}>{item.before}</ReactMarkdown>}
                         {item?.title && (item?.search || item?.tagContent) && (
                             <TitleWrapper
                             key={index + "title"}
                             title={item.title}
                             content={item.search || item.tagContent} // Use whichever exists
                             done={item.done}
                             />
                         )}
                     </div>
                 );
             }
        }
        return null; // Should not happen with new logic
      })}
    </div>
  );
};
