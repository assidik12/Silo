import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageSquare, Star, Bug, Lightbulb, Heart, ArrowLeft, User, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import ExportFeedbackButton from '@/components/ExportFeedbackButton';

export const dynamic = 'force-dynamic';

// Helper function to sensor name
function sensorName(name: string) {
  if (!name) return "Anonymous User";
  const parts = name.split(" ");
  return parts.map(p => p[0] + "*".repeat(Math.max(0, p.length - 1))).join(" ");
}

export default async function AdminFeedbackPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch feedback with user details
  const { data: rawFeedback, error } = await supabase
    .from('feedback')
    .select(`
      *,
      users!user_id (name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Error loading feedback: {error.message}</div>;
  }

  // Sorting: Type 'general' goes to the top
  const feedbackList = [...(rawFeedback || [])].sort((a, b) => {
    if (a.type === 'general' && b.type !== 'general') return -1;
    if (a.type !== 'general' && b.type === 'general') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calculate Stats
  const total = feedbackList.length;
  const avgRating = total > 0 
    ? (feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbackList.filter(f => f.rating).length).toFixed(1)
    : 0;
  const bugCount = feedbackList.filter(f => f.category === 'bug').length;
  const ideaCount = feedbackList.filter(f => f.category === 'idea').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Admin Feedback <span className="text-indigo-600">Monitoring</span></h1>
            <p className="text-slate-500">Evaluasi performa DoJo dari kacamata user.</p>
          </div>
          <div className="flex items-center gap-4">
            <ExportFeedbackButton />
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Logged in as</p>
                  <p className="text-sm font-bold text-slate-700">{user.email}</p>
               </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Feedback</p>
            <p className="text-3xl font-black text-slate-900">{total}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg AI Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-indigo-600">{avgRating}</p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Bugs Reported</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-red-500">{bugCount}</p>
              <Bug className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Feature Ideas</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-emerald-500">{ideaCount}</p>
              <Lightbulb className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type / Category</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Message & Rating</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackList.map((item) => {
                  const isGeneral = item.type === 'general';
                  const displayName = isGeneral ? (item.users?.name || 'Anonymous User') : sensorName(item.users?.name);
                  const displayEmail = isGeneral ? (item.users?.email || 'N/A') : 'S*n*o*e*d';
                  
                  return (
                    <tr key={item.id} className={`transition-colors ${isGeneral ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-6 py-4">
                        <p className={`font-bold ${isGeneral ? 'text-indigo-900' : 'text-slate-800'}`}>{displayName}</p>
                        <p className="text-[10px] text-slate-400 font-mono italic">
                          {isGeneral ? displayEmail : `ID: ${item.user_id.substring(0, 8)}...`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                            item.type === 'ai_breakdown' ? 'bg-purple-100 text-purple-600' :
                            item.type === 'ai_tutor' ? 'bg-blue-100 text-blue-600' :
                            item.type === 'milestone' ? 'bg-orange-100 text-orange-600' :
                            'bg-indigo-600 text-white shadow-sm'
                          }`}>
                            {item.type}
                          </span>
                          <div className="flex items-center gap-1">
                            {item.category === 'bug' && <Bug className="w-3 h-3 text-red-500" />}
                            {item.category === 'idea' && <Lightbulb className="w-3 h-3 text-amber-500" />}
                            {item.category === 'love' && <Heart className="w-3 h-3 text-pink-500" />}
                            <span className="text-xs font-bold text-slate-600 capitalize">{item.category || 'General'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        {item.rating && (
                          <div className="flex gap-0.5 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-slate-600 line-clamp-2">{item.message || '-'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isGeneral && item.users?.email && (
                          <a 
                            href={`mailto:${item.users.email}?subject=Update dari DoJo: ${item.category === 'idea' ? 'Ide Fitur Kamu' : 'Masukan Kamu'}&body=Halo ${item.users.name},%0D%0A%0D%0AGue mau ngasih tau kalau masukan lo tentang "${item.message}" udah kita terima dan lagi diproses/selesai dibuat!%0D%0A%0D%0AKeep nugas and stay productive!🚀`}
                            className="inline-flex items-center gap-2 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border border-indigo-100 shadow-sm hover:shadow-md"
                          >
                            <Mail className="w-3 h-3" />
                            REPLY UPDATE
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {feedbackList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                      Belum ada feedback yang masuk. Semangat nungguin, ngab! ☕
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
