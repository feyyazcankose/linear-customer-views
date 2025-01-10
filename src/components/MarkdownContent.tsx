import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content?: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;
  
  return (
    <div style={{ color: '#666' }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
