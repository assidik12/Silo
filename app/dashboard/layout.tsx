import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';
import FeedbackWidget from '@/components/feedback/FeedbackWidget';
import { PomodoroProvider } from '@/components/providers/PomodoroProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient>
      <PomodoroProvider>
        {children}
      </PomodoroProvider>
      <FeedbackWidget />
    </DashboardLayoutClient>
  );
}
