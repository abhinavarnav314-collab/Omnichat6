import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useMetaStore } from '../../store/useMetaStore';

export default function CustomAppBuilder({ onBack }: { onBack: () => void }) {
  const { addCustomApp } = useMetaStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('Analyze the following:\n\n{{input1}}');
  const [fields, setFields] = useState<Array<{ name: string; type: string; description: string; required: boolean }>>([
    { name: 'input1', type: 'text', description: 'Main input data', required: true }
  ]);

  const handleAddField = () => {
    setFields([...fields, { name: `input${fields.length + 1}`, type: 'text', description: '', required: true }]);
  };

  const handleUpdateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await addCustomApp({
      name,
      description,
      icon: 'Cpu',
      fields,
      promptTemplate
    });
    onBack();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-button" title="Back">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-semibold text-[15px]">Create Custom App</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex items-center gap-2 bg-[var(--accent-color)] text-white px-4 py-1.5 rounded-md font-medium text-[13px] disabled:opacity-50"
        >
          <Save size={14} /> Save App
        </button>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
        <section className="surface-panel p-6">
          <h2 className="text-[14px] font-semibold mb-4 text-[var(--text-primary)]">App Details</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">App Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Code Summarizer"
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Brief description of what this app does..."
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[14px] h-20 resize-none"
              />
            </div>
          </div>
        </section>

        <section className="surface-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Input Fields</h2>
            <button onClick={handleAddField} className="linear-button-secondary py-1 text-[12px]"><Plus size={12}/> Add Field</button>
          </div>
          
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={i} className="flex gap-3 items-start bg-[var(--bg-base)] border border-[var(--border-subtle)] p-3 rounded-md">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Variable Name</label>
                    <input type="text" value={f.name} onChange={e => handleUpdateField(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-[var(--border-subtle)] text-[13px] outline-none pb-1" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Type</label>
                    <select value={f.type} onChange={e => handleUpdateField(i, 'type', e.target.value)} className="w-full bg-transparent border-b border-[var(--border-subtle)] text-[13px] outline-none pb-1">
                      <option value="text">Text (Short)</option>
                      <option value="textarea">Textarea (Long)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Description</label>
                    <input type="text" value={f.description} onChange={e => handleUpdateField(i, 'description', e.target.value)} placeholder="e.g. Paste the source code here" className="w-full bg-transparent border-b border-[var(--border-subtle)] text-[13px] outline-none pb-1" />
                  </div>
                </div>
                <button onClick={() => handleRemoveField(i)} className="icon-button text-[var(--text-muted)] hover:text-[var(--error-color)] mt-4">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel p-6">
          <h2 className="text-[14px] font-semibold mb-4 text-[var(--text-primary)]">Prompt Template</h2>
          <p className="text-[12px] text-[var(--text-secondary)] mb-3">
            Define the AI prompt. Use <code className="bg-[var(--bg-base)] px-1 rounded text-[var(--accent-color)]">{`{{variable_name}}`}</code> to inject the input fields from above.
          </p>
          <textarea 
            value={promptTemplate} 
            onChange={e => setPromptTemplate(e.target.value)} 
            className="w-full h-64 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md p-4 text-[13px] font-mono resize-none focus:border-[var(--accent-color)] outline-none"
          />
        </section>
      </div>
    </div>
  );
}
