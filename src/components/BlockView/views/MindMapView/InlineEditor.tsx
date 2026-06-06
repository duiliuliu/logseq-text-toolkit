/**
 * InlineEditor 内联编辑器组件
 */

import React, { forwardRef, useCallback } from 'react';

interface InlineEditorProps {
  content: string;
  onChange: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const InlineEditor = forwardRef<HTMLDivElement, InlineEditorProps>(
  ({ content, onChange, onFocus, onBlur, placeholder }, ref) => {
    const handleInput = useCallback(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        onChange(ref.current.textContent || '');
      }
    }, [onChange, ref]);

    return (
      <div
        ref={ref}
        className="ltt-mindmap-inline-editor"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onFocus={onFocus}
        onBlur={onBlur}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
);
