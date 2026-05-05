import TaskForm from '@/components/TaskForm';

export default function CreateTaskPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Task</h1>
        <p className="text-sm text-gray-600">Schedule a new task and we will sync it automatically with your Google Calendar.</p>
      </header>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <TaskForm />
      </div>
    </div>
  );
}
