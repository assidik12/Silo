import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch only pending tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('scheduled_time', { ascending: true });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back, {user.email}</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 text-center min-w-32">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Score</p>
          <p className="text-3xl font-extrabold text-indigo-600">0 XP</p>
        </div>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Ongoing Tasks</h2>
        
        {!tasks || tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 mb-6">No ongoing tasks right now. Time to chill or schedule a new one.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
