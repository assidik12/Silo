import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';
import { PomodoroProvider } from '@/components/providers/PomodoroProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient>
      <PomodoroProvider>
        {children}
      </PomodoroProvider>
    </DashboardLayoutClient>
  );
}
