import { create } from 'zustand';
import { ContextBlock, ScheduledTask, AppWorkflow, CustomApp, PrivacyNote } from '../types';
import { 
  getContextBlocks, saveContextBlock, deleteContextBlock,
  getTasks, saveTask, deleteTask,
  getWorkflows, saveWorkflow, deleteWorkflow,
  getCustomApps, saveCustomApp, deleteCustomApp,
  getPrivacyNotes, savePrivacyNote, deletePrivacyNote
} from '../services/db';

interface MetaState {
  contextBlocks: ContextBlock[];
  tasks: ScheduledTask[];
  workflows: AppWorkflow[];
  customApps: CustomApp[];
  privacyNotes: PrivacyNote[];
  
  loadData: () => Promise<void>;
  
  addContextBlock: (block: Omit<ContextBlock, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContextBlock: (id: string, updates: Partial<ContextBlock>) => Promise<void>;
  removeContextBlock: (id: string) => Promise<void>;
  
  addTask: (task: Omit<ScheduledTask, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<ScheduledTask>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  
  addWorkflow: (wf: Omit<AppWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkflow: (id: string, updates: Partial<AppWorkflow>) => Promise<void>;
  removeWorkflow: (id: string) => Promise<void>;
  
  addCustomApp: (app: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomApp: (id: string, updates: Partial<CustomApp>) => Promise<void>;
  removeCustomApp: (id: string) => Promise<void>;
  
  addPrivacyNote: (note: Omit<PrivacyNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrivacyNote: (id: string, updates: Partial<PrivacyNote>) => Promise<void>;
  removePrivacyNote: (id: string) => Promise<void>;
}

export const useMetaStore = create<MetaState>((set, get) => ({
  contextBlocks: [],
  tasks: [],
  workflows: [],
  customApps: [],
  privacyNotes: [],

  loadData: async () => {
    const [blocks, tasks, workflows, apps, notes] = await Promise.all([
      getContextBlocks(),
      getTasks(),
      getWorkflows(),
      getCustomApps(),
      getPrivacyNotes()
    ]);
    set({
      contextBlocks: blocks,
      tasks: tasks,
      workflows: workflows,
      customApps: apps,
      privacyNotes: notes
    });
  },

  addContextBlock: async (block) => {
    const newBlock: ContextBlock = {
      ...block,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveContextBlock(newBlock);
    set(state => ({ contextBlocks: [...state.contextBlocks, newBlock] }));
  },
  updateContextBlock: async (id, updates) => {
    const blocks = get().contextBlocks;
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const updated = { ...blocks[idx], ...updates, updatedAt: Date.now() };
    await saveContextBlock(updated);
    const newBlocks = [...blocks];
    newBlocks[idx] = updated;
    set({ contextBlocks: newBlocks });
  },
  removeContextBlock: async (id) => {
    await deleteContextBlock(id);
    set(state => ({ contextBlocks: state.contextBlocks.filter(b => b.id !== id) }));
  },

  addTask: async (task) => {
    const newTask: ScheduledTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    await saveTask(newTask);
    set(state => ({ tasks: [...state.tasks, newTask] }));
  },
  updateTask: async (id, updates) => {
    const tasks = get().tasks;
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const updated = { ...tasks[idx], ...updates };
    await saveTask(updated);
    const newTasks = [...tasks];
    newTasks[idx] = updated;
    set({ tasks: newTasks });
  },
  removeTask: async (id) => {
    await deleteTask(id);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },

  addWorkflow: async (wf) => {
    const newWf: AppWorkflow = {
      ...wf,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveWorkflow(newWf);
    set(state => ({ workflows: [...state.workflows, newWf] }));
  },
  updateWorkflow: async (id, updates) => {
    const wfs = get().workflows;
    const idx = wfs.findIndex(w => w.id === id);
    if (idx === -1) return;
    const updated = { ...wfs[idx], ...updates, updatedAt: Date.now() };
    await saveWorkflow(updated);
    const newWfs = [...wfs];
    newWfs[idx] = updated;
    set({ workflows: newWfs });
  },
  removeWorkflow: async (id) => {
    await deleteWorkflow(id);
    set(state => ({ workflows: state.workflows.filter(w => w.id !== id) }));
  },

  addCustomApp: async (app) => {
    const newApp: CustomApp = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveCustomApp(newApp);
    set(state => ({ customApps: [...state.customApps, newApp] }));
  },
  updateCustomApp: async (id, updates) => {
    const apps = get().customApps;
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return;
    const updated = { ...apps[idx], ...updates, updatedAt: Date.now() };
    await saveCustomApp(updated);
    const newApps = [...apps];
    newApps[idx] = updated;
    set({ customApps: newApps });
  },
  removeCustomApp: async (id) => {
    await deleteCustomApp(id);
    set(state => ({ customApps: state.customApps.filter(a => a.id !== id) }));
  },

  addPrivacyNote: async (note) => {
    const newNote: PrivacyNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await savePrivacyNote(newNote);
    set(state => ({ privacyNotes: [...state.privacyNotes, newNote] }));
  },
  updatePrivacyNote: async (id, updates) => {
    const notes = get().privacyNotes;
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return;
    const updated = { ...notes[idx], ...updates, updatedAt: Date.now() };
    await savePrivacyNote(updated);
    const newNotes = [...notes];
    newNotes[idx] = updated;
    set({ privacyNotes: newNotes });
  },
  removePrivacyNote: async (id) => {
    await deletePrivacyNote(id);
    set(state => ({ privacyNotes: state.privacyNotes.filter(n => n.id !== id) }));
  }
}));
