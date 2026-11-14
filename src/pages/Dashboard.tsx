import { useEffect, useState } from 'react';
import {
  TrendingUp, Wallet, Users, ArrowRight, Activity,
  Sprout, Award, Crown, Gem, Diamond, Rocket,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { PLANS } from '@/data/plans';
import { supabase } from '@/lib/supabase';
import type { Investment } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Sprout, Award, Crown, Gem, Diamond, Rocket,
};

const SLIDES = [
  {
    title: 'Daily Returns',
    subtitle: 'Earn up to ₱4,500 daily',
    image: 'https://images.pexels.com/photos/6178936/pexels-photo-6178936.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    title: 'Grow Your Wealth',
    subtitle: 'Invest smart, earn daily',
    image: 'https://images.pexels.com/photos/9548239/pexels-photo-9548239.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    title: 'Referral Bonus',
    subtitle: 'Get 20% on every invite',
    image: 'https://images.pexels.com/photos/36918732/pexels-photo-36918732.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    title: 'Secure Platform',
    subtitle: 'Your investment is safe',
    image: 'https://images.pexels.com/photos/5088860/pexels-photo-5088860.png?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    title: 'Start from ₱500',
    subtitle: 'Affordable plans for everyone',
    image: 'https://images.pexels.com/photos/3155656/pexels-photo-3155656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('investments')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setInvestments(data as Investment[]);
        });
    }
  }, [profile?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const totalEarned = investments.reduce((sum, inv) => sum + Number(inv.total_earned), 0);
  const dailyEarnings = investments.reduce((sum, inv) => sum + Number(inv.daily_return), 0);

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-xl border-b border-navy-800/50">
        <div className="px-5 py-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-accent-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Vantrex</h1>
              <p className="text-[10px] text-navy-400 mt-0.5">Welcome back, {profile?.username || 'Investor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-800/60 border border-navy-700/50">
            <Activity size={12} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium">Active</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 space-y-5">
        {/* Carousel */}
        <div className="pt-5 animate-fade-in-up">
          <div className="relative rounded-2xl overflow-hidden h-32 bg-navy-900">
            <div className="flex transition-transform duration-700 ease-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {SLIDES.map((slide, i) => (
                <div key={i} className="min-w-full h-full relative">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/70 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-5">
                    <h3 className="text-white font-bold text-lg">{slide.title}</h3>
                    <p className="text-cyan-300 text-xs mt-0.5">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="absolute bottom-2 right-3 flex gap-1.5">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-5 bg-cyan-400' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-navy-700/50 p-5 overflow-hidden animate-fade-in-up delay-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-navy-300 text-xs font-medium">Total Balance</span>
              <Wallet size={16} className="text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              ₱{Number(profile?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-navy-950/50 rounded-xl p-3">
                <p className="text-[10px] text-navy-400">Daily Earnings</p>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  ₱{dailyEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex-1 bg-navy-950/50 rounded-xl p-3">
                <p className="text-[10px] text-navy-400">Total Earned</p>
                <p className="text-sm font-semibold text-cyan-400 mt-0.5">
                  ₱{totalEarned.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-200">
          {[
            { label: 'Active Plans', value: investments.length, icon: TrendingUp, color: 'text-cyan-400' },
            { label: 'Referrals', value: 0, icon: Users, color: 'text-amber-400' },
            { label: 'Earned', value: `₱${totalEarned.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`, icon: Activity, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-navy-900 rounded-xl p-3 border border-navy-800 text-center">
              <stat.icon size={18} className={`mx-auto mb-1.5 ${stat.color}`} />
              <p className="text-white font-bold text-sm">{stat.value}</p>
              <p className="text-navy-500 text-[9px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Invest Now Banner */}
        <button
          onClick={() => navigate('plan')}
          className="w-full group relative rounded-2xl bg-gradient-to-r from-cyan-500/20 to-accent-700/20 border border-cyan-500/30 p-4 flex items-center justify-between overflow-hidden hover:from-cyan-500/30 hover:to-accent-700/30 transition-all duration-300 animate-fade-in-up delay-300"
        >
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Start Investing</p>
            <p className="text-navy-400 text-xs mt-0.5">Choose a plan and earn daily</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight size={18} className="text-cyan-400" />
          </div>
          <div className="absolute inset-0 shimmer pointer-events-none" />
        </button>

        {/* My Investments */}
        {investments.length > 0 && (
          <div className="animate-fade-in-up delay-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">My Investments</h2>
              <button onClick={() => navigate('plan')} className="text-cyan-400 text-xs font-medium">
                View all
              </button>
            </div>
            <div className="space-y-2.5">
              {investments.slice(0, 3).map((inv, i) => {
                const plan = PLANS.find((p) => p.name === inv.plan_name);
                const Icon = plan ? ICON_MAP[plan.icon] : TrendingUp;
                const daysPassed = Math.floor((Date.now() - new Date(inv.start_date).getTime()) / 86400000);
                const progress = Math.min((daysPassed / inv.cycle_days) * 100, 100);
                return (
                  <div
                    key={inv.id}
                    className="bg-navy-900 rounded-xl p-4 border border-navy-800 animate-slide-in-right"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan?.gradient || 'from-navy-600 to-navy-800'} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{inv.plan_name}</p>
                        <p className="text-navy-500 text-xs">₱{Number(inv.daily_return).toLocaleString()} / day</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-navy-400">Day {Math.min(daysPassed, inv.cycle_days)} / {inv.cycle_days}</span>
                      <span className="text-cyan-400">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Plans */}
        <div className="animate-fade-in-up delay-400">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm">Featured Plans</h2>
            <button onClick={() => navigate('plan')} className="text-cyan-400 text-xs font-medium">
              See all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {PLANS.slice(0, 4).map((plan, i) => {
              const Icon = ICON_MAP[plan.icon];
              return (
                <button
                  key={plan.id}
                  onClick={() => navigate('plan')}
                  className="flex-shrink-0 w-36 rounded-2xl bg-navy-900 border border-navy-800 p-4 text-left hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="text-white text-xs font-semibold">{plan.name}</p>
                  <p className="text-cyan-400 text-[10px] mt-1">₱{plan.price.toLocaleString()}</p>
                  <p className="text-navy-500 text-[10px] mt-0.5">₱{plan.dailyReturn.toLocaleString()}/day</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
