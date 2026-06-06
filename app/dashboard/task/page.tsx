import TaskCard from '@/components/tasks/TaskCard';
import TaskForm from '@/components/tasks/TaskForm';
import { Task } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CreateTaskPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }
  
  // Fetch only completed tasks
  const { data: doneTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .order('scheduled_time', { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-200">Create Task</h1>
        <p className="text-sm text-gray-600 dark:text-slate-300">Schedule a new task and we will sync it automatically with your Google Calendar.</p>
      </header>
      
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-200">
        <TaskForm />
      </div>

      {/* History Section merged into Dashboard */}
      <div className="space-y-4 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Task History</h2>
        
        {!doneTasks || doneTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-gray-200">No history yet</h3>
            <p className="text-sm text-gray-500">Complete some tasks to see your history grow here!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {doneTasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
