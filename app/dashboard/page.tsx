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
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('scheduled_time', { ascending: true });

  // Fetch Gamification User Stats
  const { data: userData } = await supabase
    .from('users')
    .select('xp, streak_count')
    .eq('id', user.id)
    .single();

  const xp = userData?.xp || 0;
  const streak = userData?.streak_count || 0;

  // Calculate Weekly Completion
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  const { data: weekTasks } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('user_id', user.id)
    .gte('scheduled_time', startOfWeek.toISOString())
    .lte('scheduled_time', endOfWeek.toISOString());

  const totalWeekTasks = weekTasks?.length || 0;
  const doneWeekTasks = weekTasks?.filter(t => t.status === 'done').length || 0;
  const weeklyProgress = totalWeekTasks === 0 ? 0 : Math.round((doneWeekTasks / totalWeekTasks) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back, {user.email}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Streak</p>
              <p className="text-xl font-extrabold text-orange-600">{streak} Days</p>
            </div>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 text-center min-w-32">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Score</p>
            <p className="text-2xl font-extrabold text-indigo-600">{xp} XP</p>
          </div>
        </div>
      </header>

      {/* Weekly Progress Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between text-sm font-medium mb-3">
          <span className="text-gray-700">Weekly Task Completion</span>
          <span className="text-indigo-600">{weeklyProgress}% ({doneWeekTasks}/{totalWeekTasks} tasks)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-indigo-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${weeklyProgress}%` }}
          ></div>
        </div>
      </div>

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
