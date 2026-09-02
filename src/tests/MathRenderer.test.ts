import { describe, it, expect } from 'vitest';
import { preprocessMath } from '../utils/mathFormatter';

describe('Math and Formula Preprocessor', () => {
  it('handles ($CaSO_4 \\cdot 2H_2O$) correctly', () => {
    const input = 'Gypsum has the chemical formula ($CaSO_4 \\cdot 2H_2O$).';
    const output = preprocessMath(input);
    expect(output).toContain('$CaSO_4 \\cdot 2H_2O$');
  });

  it('normalizes LaTeX \\( ... \\) inline math delimiters', () => {
    const input = 'The mass-energy formula is \\(E = mc^2\\).';
    const output = preprocessMath(input);
    expect(output).toBe('The mass-energy formula is $E = mc^2$.');
  });

  it('normalizes LaTeX \\[ ... \\] display math delimiters', () => {
    const input = 'Here is the integral: \\[ \\int_0^\\infty e^{-x} dx = 1 \\]';
    const output = preprocessMath(input);
    expect(output).toContain('$$');
    expect(output).toContain('\\int_0^\\infty e^{-x} dx = 1');
  });

  it('wraps unwrapped formulas with \\cdot or \\frac into math format', () => {
    const input = 'Consider CaSO_4 \\cdot 2H_2O in water.';
    const output = preprocessMath(input);
    expect(output).toContain('$');
    expect(output).toContain('CaSO_4 \\cdot 2H_2O');
  });

  it('preserves code blocks without corrupting them', () => {
    const input = '```python\n# This has \\cdot and \\frac\nx = 10\n```\nAnd math: \\(x^2 + y^2 = r^2\\)';
    const output = preprocessMath(input);
    expect(output).toContain('```python\n# This has \\cdot and \\frac\nx = 10\n```');
    expect(output).toContain('$x^2 + y^2 = r^2$');
  });
});
