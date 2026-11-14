import { LayoutDashboard, TrendingUp, Users, Wallet } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const { page, navigate } = useRouter();
  const { profile } = useAuth();

  const items = [
    { id: 'dashboard' as const, label: 'Home', icon: LayoutDashboard },
    { id: 'plan' as const, label: 'Plan', icon: TrendingUp },
    { id: 'team' as const, label: 'Team', icon: Users },
    { id: 'account' as const, label: 'Account', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-xl border-t border-navy-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {items.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 group"
            >
              <div className={`relative transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
                <Icon
                  size={22}
                  className={`transition-colors duration-300 ${
                    active ? 'text-cyan-400' : 'text-navy-500 group-hover:text-navy-300'
                  }`}
                />
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  active ? 'text-cyan-400' : 'text-navy-500 group-hover:text-navy-300'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {profile && (
        <div className="sr-only">Balance: {profile.balance}</div>
      )}
    </nav>
  );
}
