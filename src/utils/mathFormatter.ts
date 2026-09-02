/**
 * Comprehensive Math & LaTeX preprocessor for LLM output.
 * Normalizes delimiters, converts raw/unwrapped LaTeX commands (\cdot, \frac, \sqrt, etc.),
 * and ensures remark-math and rehype-katex render chemical & mathematical formulas flawlessly
 * without leaking raw backslashes, broken italics from underscores, or unrendered signs.
 */

export function preprocessMath(content: string): string {
  if (!content || typeof content !== 'string') return '';

  // Step 1: Protect code blocks and inline code from any math transformations
  const codeBlocks: string[] = [];
  let processed = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Step 2: Normalize display math \[ ... \] or \\[ ... \\] to $$ ... $$
  processed = processed.replace(/\\\\?\[([\s\S]*?)\\\\?\]/g, (_match, math) => {
    return `\n$$\n${math.trim()}\n$$\n`;
  });

  // Step 3: Normalize inline math \( ... \) or \\( ... \\) to $ ... $
  processed = processed.replace(/\\\\?\(([\s\S]*?)\\\\?\)/g, (_match, math) => {
    return `$${math.trim()}$`;
  });

  // Step 4: Convert unwrapped LaTeX math / chemistry formulas that have \cdot or \frac or \sqrt outside of $...$
  const parts = processed.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);
  const transformedParts = parts.map((part) => {
    // If it's already a math block ($...$ or $$...$$), keep it as-is
    if (part.startsWith('$')) {
      return part;
    }

    let text = part;

    // Fix formulas with LaTeX commands like \cdot, \frac, \sqrt, \pm, \alpha, \beta, etc.
    // e.g. "CaSO_4 \cdot 2H_2O" or "(CaSO_4 \cdot 2H_2O)" or "\frac{a}{b}"
    const mathRegex = /(\(?[A-Za-z0-9_{}^+\-=/]*\s*\\(?:cdot|frac|sqrt|times|pm|approx|neq|le|ge|alpha|beta|gamma|delta|Delta|pi|theta|sigma|mu|sum|int|prod|infty|partial|nabla|to|rightarrow|leftarrow|text|mathrm|ce)[A-Za-z0-9_{}^+\-=/(){}. \t]*\)?)/g;

    text = text.replace(mathRegex, (match) => {
      const trimmed = match.trim();
      if (!trimmed) return match;
      
      // If it starts with ( and ends with ) e.g. "(CaSO_4 \cdot 2H_2O)"
      if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(1, -1).trim();
        return `($${inner}$)`;
      }
      return `$${trimmed}$`;
    });

    return text;
  });

  processed = transformedParts.join('');

  // Step 5: Restore code blocks
  processed = processed.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
    return codeBlocks[parseInt(index, 10)] || '';
  });

  return processed;
}
