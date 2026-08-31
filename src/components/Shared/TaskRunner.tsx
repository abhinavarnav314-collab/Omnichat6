import { useEffect } from 'react';
import { useMetaStore } from '../../store/useMetaStore';
import { saveTaskResult } from '../../services/db';

export default function TaskRunner() {
  const { tasks, updateTask } = useMetaStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const activeTasks = tasks.filter(t => t.active && t.nextRun <= now);
      
      for (const task of activeTasks) {
        // Pseudo execution logic for now
        // Normally would use the chatService to run a prompt or app
        console.log('Running task:', task.title);
        
        await saveTaskResult({
          id: crypto.randomUUID(),
          taskId: task.id,
          result: `Executed task ${task.title} at ${new Date(now).toISOString()}`,
          timestamp: now
        });
        
        // Update next run (simplistic daily bump for now)
        const nextRun = now + 24 * 60 * 60 * 1000; 
        updateTask(task.id, { lastRun: now, nextRun });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, updateTask]);

  return null;
}
