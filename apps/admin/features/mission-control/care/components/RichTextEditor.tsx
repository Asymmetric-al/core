import React from "react";
import { Textarea } from "@asym/ui/components/shadcn/textarea";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  className,
  minHeight,
  onKeyDown,
}) => {
  // Simple implementation using Textarea for now to avoid dependency issues with tiptap in this environment
  // In a full implementation, this would be a Tiptap wrapper.
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      style={{ minHeight }}
      onKeyDown={onKeyDown}
    />
  );
};
