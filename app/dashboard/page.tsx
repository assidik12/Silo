import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TaskCard from '@/components/tasks/TaskCard';
import GamificationStats from '@/components/dashboard/GamificationStats';
import WeeklyInsightChart from '@/components/dashboard/WeeklyInsightChart';
import { Task } from '@/types';
import PersonalizationTrigger from '@/components/profile/PersonalizationTrigger';
import MilestoneFeedbackTrigger from '@/components/feedback/MilestoneFeedbackTrigger';

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
    .select('name, xp, streak_count, onboarding_completed')
    .eq('id', user.id)
    .single();

  const name = userData?.name || user.email?.split('@')[0] || 'User';
  const xp = userData?.xp || 0;
  const streak = userData?.streak_count || 0;
  const onboardingCompleted = userData?.onboarding_completed || false;

  // Calculate Weekly Completion & Chart Data (Past 7 Days)
  const now = new Date();
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const startDateStr = past7Days[0].toISOString();
  // set to end of current day
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const endDateStr = endOfToday.toISOString();

  // Tasks in past 7 days
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('id, scheduled_time, status')
    .eq('user_id', user.id); // Fetch all tasks so client can filter properly by their local timezone

  // Learning done
  const { data: recentLearning } = await supabase
    .from('learning_history')
    .select('id, created_at')
    .eq('user_id', user.id);

  // Calculate Weekly Completion
  const totalWeekTasks = recentTasks?.length || 0;
  const doneWeekTasks = recentTasks?.filter(t => t.status === 'done').length || 0;
  const weeklyProgress = totalWeekTasks === 0 ? 0 : Math.round((doneWeekTasks / totalWeekTasks) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Welcome back, {name}</p>
        </div>
        
        <GamificationStats streak={streak} xp={xp} />
      </header>

      {/* Weekly Progress Bar */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800">
        <div className="flex justify-between text-sm font-medium mb-3">
          <span className="text-gray-700 dark:text-slate-200">Weekly Task Completion</span>
          <span className="text-indigo-600 dark:text-indigo-400">{weeklyProgress}% ({doneWeekTasks}/{totalWeekTasks} tasks)</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3">
          <div 
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${weeklyProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Ongoing Tasks</h2>
        
        {!tasks || tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center bg-white dark:bg-slate-900/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">No ongoing tasks right now. Time to chill or schedule a new one.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      <WeeklyInsightChart recentTasks={recentTasks || []} recentLearning={recentLearning || []} />
      
      <PersonalizationTrigger completed={onboardingCompleted} />
      <MilestoneFeedbackTrigger />
    </div>
  );
}
