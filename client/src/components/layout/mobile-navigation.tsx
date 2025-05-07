import { Link, useLocation } from "wouter";

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden bg-dark-surface border-b border-dark-border fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-home-4-line text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/dashboard" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/dashboard' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-dashboard-line text-xl"></i>
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link href="/courses" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/courses' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-book-open-line text-xl"></i>
          <span className="text-xs mt-1">Courses</span>
        </Link>
        <Link href="/battle-zone" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/battle-zone' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-sword-line text-xl"></i>
          <span className="text-xs mt-1">Battle</span>
        </Link>
        <Link href="/ai-tutor" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/ai-tutor' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-brain-line text-xl"></i>
          <span className="text-xs mt-1">AI Tutor</span>
        </Link>
        <Link href="/ai-tools" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/ai-tools' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-robot-line text-xl"></i>
          <span className="text-xs mt-1">AI Tools</span>
        </Link>
        <Link href="/rewards" className={`flex items-center justify-center flex-col py-2 flex-1 ${location === '/rewards' ? 'text-primary' : 'text-gray-400'}`}>
          <i className="ri-award-line text-xl"></i>
          <span className="text-xs mt-1">Rewards</span>
        </Link>
      </div>
    </div>
  );
}
