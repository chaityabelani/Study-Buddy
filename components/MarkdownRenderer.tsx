
import React, { useState, useEffect } from 'react';
import FormulaExplainer from './FormulaExplainer';

// KaTeX is loaded from CDN and will be on the window object
declare const katex: any;

interface MarkdownRendererProps {
  content: string;
  disableFormulaExplainer?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, disableFormulaExplainer = false }) => {
  const [isKaTeXLoaded, setIsKaTeXLoaded] = useState(typeof katex !== 'undefined');

  useEffect(() => {
    // If katex is already loaded during initialization, do nothing more.
    if (typeof katex !== 'undefined') {
        if (!isKaTeXLoaded) setIsKaTeXLoaded(true);
        return;
    }
    
    // If not loaded, start polling for the katex object on the window.
    const intervalId = setInterval(() => {
      if (typeof katex !== 'undefined') {
        setIsKaTeXLoaded(true);
        clearInterval(intervalId);
      }
    }, 100);

    // Cleanup function will be called on component unmount to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, [isKaTeXLoaded]);


  const renderMath = (math: string, displayMode: boolean, key: string | number) => {
    if (!isKaTeXLoaded) {
      const codeClass = displayMode 
        ? "font-mono block p-2 bg-gray-200 dark:bg-gray-900 rounded overflow-x-auto" 
        : "font-mono p-1 bg-gray-200 dark:bg-gray-900 rounded";
      const outerTag = displayMode ? `$$${math}$$` : `$${math}$`;
      return <code key={key} className={codeClass}>{outerTag}</code>;
    }
    try {
      const html = katex.renderToString(math, {
        throwOnError: true,
        displayMode: displayMode,
      });
      return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      console.error('KaTeX Error:', e);
      const codeClass = displayMode
        ? "text-red-600 dark:text-red-400 font-mono block p-2 bg-red-100 dark:bg-gray-800 rounded overflow-x-auto"
        : "text-red-600 dark:text-red-400 font-mono p-1 bg-red-100 dark:bg-gray-800 rounded";
      const outerTag = displayMode ? `$$${math}$$` : `$${math}$`;
      return <code key={key} className={codeClass}>{`Error rendering LaTeX: ${outerTag}`}</code>;
    }
  };

  const renderTextLine = (text: string, key?: string | number) => {
    // This regex splits the text by inline math delimiters, keeping the delimiters
    const parts = text.split(/(\$[\s\S]*?\$)/g);

    const renderedParts = parts.filter(Boolean).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        return renderMath(math, false, `${key}-${index}`);
      } else {
        // Handle basic markdown for non-math parts
        const styledParts = part.split(/(\*\*.*?\*\*|`.*?`|_.*?_)/g).filter(Boolean).map((textPart, i) => {
            if (textPart.startsWith('**') && textPart.endsWith('**')) {
                return <strong key={i}>{textPart.slice(2, -2)}</strong>;
            }
            if (textPart.startsWith('_') && textPart.endsWith('_')) {
                return <em key={i}>{textPart.slice(1, -1)}</em>;
            }
            if (textPart.startsWith('`') && textPart.endsWith('`')) {
                return <code key={i} className="bg-gray-200 dark:bg-gray-900 rounded px-1.5 py-1 text-sm font-mono text-cyan-700 dark:text-cyan-300">{textPart.slice(1, -1)}</code>;
            }
            return textPart;
        });
        return <span key={index}>{styledParts}</span>;
      }
    });

    return <>{renderedParts}</>;
  };
  
  const renderTextBlock = (textBlock: string, key: string | number) => {
    const lines = textBlock.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        const className = listType === 'ul' 
            ? "list-disc list-outside ml-6 my-3 space-y-2" 
            : "list-decimal list-outside ml-6 my-3 space-y-2";
        elements.push(<ListComponent key={`${listType}-${elements.length}`} className={className}>{listItems}</ListComponent>);
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      const ulMatch = line.match(/^\s*([*-])\s+(.*)/);
      const olMatch = line.match(/^\s*(\d+)\.\s+(.*)/);

      if (ulMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(<li key={`${key}-li-${i}`}>{renderTextLine(ulMatch[2], i)}</li>);
      } else if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(<li key={`${key}-li-${i}`}>{renderTextLine(olMatch[2], i)}</li>);
      } else {
        flushList();
        if (line.startsWith('### ')) {
          elements.push(<h3 key={`${key}-h3-${i}`} className="text-xl font-semibold mt-4 mb-2 text-blue-600 dark:text-blue-300">{renderTextLine(line.substring(4), i)}</h3>);
        } else if (line.trim()) {
          elements.push(<p key={`${key}-p-${i}`} className="my-3 leading-relaxed">{renderTextLine(line, i)}</p>);
        }
        // ignore empty lines for spacing
      }
    });

    flushList(); // After the loop, flush any remaining list.

    return <div key={key}>{elements}</div>;
  };

  const renderDefault = (text: string, keyPrefix: string | number) => {
    const contentBlocks = text.split(/(\$\$[\s\S]*?\$\$)/g);
    return contentBlocks.map((block, index) => {
        if (block.startsWith('$$') && block.endsWith('$$')) {
            const math = block.slice(2, -2);
            return renderMath(math, true, `${keyPrefix}-math-${index}`);
        } else if (block.trim()) {
            return renderTextBlock(block, `${keyPrefix}-text-${index}`);
        }
        return null;
    });
  };

  if (disableFormulaExplainer) {
      return <>{renderDefault(content, 'main')}</>;
  }
  
  const formulaBlockRegex = /(\$\$[\s\S]*?\$\$)\s*(### Formula Breakdown[\s\S]*?)(?=(?:$$|##\s|###\s|$))/g;
  
  if (!content.includes('### Formula Breakdown')) {
      return <>{renderDefault(content, 'main')}</>;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = formulaBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim()) {
          elements.push(renderDefault(textBefore, `text-${lastIndex}`));
      }
      
      const formula = match[1].slice(2, -2).trim();
      const explanation = match[2].trim();
      elements.push(<FormulaExplainer key={`formula-${match.index}`} formula={formula} explanation={explanation} />);

      lastIndex = formulaBlockRegex.lastIndex;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter.trim()) {
      elements.push(renderDefault(textAfter, `text-after`));
  }
  
  if (elements.length === 0) {
      return <>{renderDefault(content, 'main')}</>;
  }

  return <>{elements}</>;
};

export default MarkdownRenderer;