import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthRouterProvider, useAuthRouter } from '@/context/AuthRouterContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import BottomNav from '@/components/BottomNav';
import Login from '@/pages/Login';
import CreateAccount from '@/pages/CreateAccount';
import Dashboard from '@/pages/Dashboard';
import Plan from '@/pages/Plan';
import Team from '@/pages/Team';
import Account from '@/pages/Account';

function AppContent() {
  const { screen } = useAuthRouter();
  const { page } = useRouter();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-accent-600 mb-4 animate-pulse-glow">
            <span className="text-white text-xl font-bold">V</span>
          </div>
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (screen === 'login') return <Login />;
  if (screen === 'create') return <CreateAccount />;

  return (
    <div className="min-h-screen bg-navy-950">
      {page === 'dashboard' && <Dashboard />}
      {page === 'plan' && <Plan />}
      {page === 'team' && <Team />}
      {page === 'account' && <Account />}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthRouterProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthRouterProvider>
    </AuthProvider>
  );
}
