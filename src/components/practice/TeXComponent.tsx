import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

type TeXComponentProps = {
  children: string;
};

export function TeXComponent({ children }: TeXComponentProps) {
  // Check if the text contains any LaTeX-like expressions (enclosed in $ signs)
  const hasTeX = children.includes('$');

  if (!hasTeX) {
    return <span>{children}</span>;
  }

  // Split the text into parts, alternating between regular text and TeX expressions
  const parts = children.split(/(\$[^$]+\$)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          // Remove the $ signs and render as TeX
          const texContent = part.slice(1, -1);
          return <InlineMath key={index}>{texContent}</InlineMath>;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}