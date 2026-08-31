import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VariableModalProps {
  variables: string[];
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export default function VariableModal({ variables, onSubmit, onCancel }: VariableModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTab);
    
    const inputs = modalRef.current?.querySelectorAll('input');
    if (inputs && inputs.length > 0) {
      inputs[0].focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTab);
    };
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="surface-panel animate-scale-in w-full max-w-sm flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0">
          <h2 id="modal-title" className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">Fill Variables</h2>
          <button onClick={onCancel} aria-label="Close" className="icon-button">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto bg-[var(--bg-surface)]">
          <form id="var-form" onSubmit={handleSubmit} className="space-y-4">
            {variables.map(v => (
              <div key={v}>
                <label htmlFor={`var-${v}`} className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{v}</label>
                <input 
                  id={`var-${v}`}
                  type="text"
                  required
                  className="linear-input"
                  value={values[v] || ''}
                  onChange={e => setValues({ ...values, [v]: e.target.value })}
                />
              </div>
            ))}
          </form>
        </div>
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-end gap-2 shrink-0">
          <button onClick={onCancel} className="linear-button-secondary">
            Cancel
          </button>
          <button type="submit" form="var-form" className="linear-button-primary">
            Insert Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
