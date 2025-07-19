import { useAuth } from "@/hooks/use-auth";

export default function DashboardMinimal() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Test</h1>
      <p className="text-lg">User: {user?.name || 'Loading...'}</p>
      <p className="text-sm text-gray-400">If you see this, basic routing works.</p>
      <div className="mt-8">
        <h2 className="text-xl mb-4">Test Navigation:</h2>
        <div className="space-y-2">
          <a href="/dashboard" className="block text-blue-400 hover:text-blue-300">Original Dashboard</a>
          <a href="/ai-tutor" className="block text-blue-400 hover:text-blue-300">AI Tutor</a>
          <a href="/battle-zone" className="block text-blue-400 hover:text-blue-300">Battle Zone</a>
        </div>
      </div>
    </div>
  );
}