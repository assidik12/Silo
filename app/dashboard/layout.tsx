import Sidebar from '@/components/Sidebar';
import FeedbackWidget from '@/components/FeedbackWidget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 w-full max-w-[100vw]">
        {/* Margin atas (pt-14) hanya di layar kecil agar tidak tertutup tombol menu */}
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </div>
      <FeedbackWidget />
    </div>
  );
}
