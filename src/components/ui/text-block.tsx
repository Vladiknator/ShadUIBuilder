interface TextBlockProps {
  data?: {
    content: string;
  };
}

export function TextBlock({ data = { content: 'Enter your text here...' } }: TextBlockProps) {
  return (
    <div className="w-full h-full p-4">
      <div className="prose prose-sm max-w-none">
        {data.content.split('\n').map((line, i) => (
          <p key={i} className="mb-2">{line}</p>
        ))}
      </div>
    </div>
  );
} 