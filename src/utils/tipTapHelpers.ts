/**
 * Convertir texto plano a JSON de TipTap
 */
export function textToTipTapJSON(text: string) {
  const lines = text.split('\n').filter(line => line.trim() || line.length === 0);
  return {
    type: 'doc',
    content: lines.map(line => {
      if (line.trim()) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: line }]
        };
      } else {
        return {
          type: 'paragraph'
        };
      }
    })
  };
}

