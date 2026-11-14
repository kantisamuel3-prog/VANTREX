import { useEffect, useState } from 'react';
import {
  Sprout, Award, Crown, Gem, Diamond, Rocket,
  Check, type LucideIcon, TrendingUp, AlertCircle, X,
} from 'lucide-react';
import { PLANS } from '@/data/plans';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import type { Investment } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Sprout, Award, Crown, Gem, Diamond, Rocket,
};

export default function Plan() {
  const { profile, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('investments')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setInvestments(data as Investment[]);
        });
    }
  }, [profile?.id]);

  const handleInvest = async () => {
    if (!selectedPlan || !profile) return;
    setError(null);
    setInvesting(true);

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.cycleDays);

      const { error: invError } = await supabase.from('investments').insert({
        user_id: profile.id,
        plan_name: selectedPlan.name,
        plan_amount: selectedPlan.price,
        daily_return: selectedPlan.dailyReturn,
        cycle_days: selectedPlan.cycleDays,
        end_date: endDate.toISOString(),
        status: 'active',
        total_earned: 0,
        last_claim_date: new Date().toISOString(),
      });

      if (invError) throw invError;

      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'investment',
        amount: selectedPlan.price,
        status: 'completed',
        description: `Invested in ${selectedPlan.name}`,
      });

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedPlan(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start investment');
    } finally {
      setInvesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-xl border-b border-navy-800/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-accent-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Investment Plans</h1>
              <p className="text-[10px] text-navy-400 mt-0.5">Choose a plan to start earning daily</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 space-y-4">
        {/* My Active Investments */}
        {investments.filter((i) => i.status === 'active').length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-white font-semibold text-sm mb-3">My Active Plans</h2>
            <div className="space-y-2">
              {investments.filter((i) => i.status === 'active').map((inv) => {
                const plan = PLANS.find((p) => p.name === inv.plan_name);
                const Icon = plan ? ICON_MAP[plan.icon] : TrendingUp;
                const daysPassed = Math.floor((Date.now() - new Date(inv.start_date).getTime()) / 86400000);
                const progress = Math.min((daysPassed / inv.cycle_days) * 100, 100);
                return (
                  <div key={inv.id} className="bg-navy-900 rounded-xl p-3.5 border border-navy-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${plan?.gradient || 'from-navy-600 to-navy-800'} flex items-center justify-center`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{inv.plan_name}</p>
                        <p className="text-navy-500 text-[10px]">₱{Number(inv.daily_return).toLocaleString()} / day</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-accent-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-navy-400 text-[10px] mt-1.5">Day {Math.min(daysPassed, inv.cycle_days)} of {inv.cycle_days}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Plans */}
        <div className="animate-fade-in-up delay-100">
          <h2 className="text-white font-semibold text-sm mb-3">All Plans</h2>
          <div className="space-y-3">
            {PLANS.map((plan, i) => {
              const Icon = ICON_MAP[plan.icon];
              return (
                <div
                  key={plan.id}
                  className="group relative rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-navy-800 overflow-hidden hover:border-cyan-500/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: plan.color }} />
                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={22} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-sm">{plan.name}</h3>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
                              {plan.tag}
                            </span>
                          </div>
                          <p className="text-navy-400 text-xs mt-0.5">31-day cycle</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-navy-950/50 rounded-lg p-2.5 text-center">
                        <p className="text-navy-500 text-[9px]">Price</p>
                        <p className="text-white font-bold text-sm mt-0.5">₱{plan.price.toLocaleString()}</p>
                      </div>
                      <div className="bg-navy-950/50 rounded-lg p-2.5 text-center">
                        <p className="text-navy-500 text-[9px]">Daily</p>
                        <p className="text-emerald-400 font-bold text-sm mt-0.5">₱{plan.dailyReturn.toLocaleString()}</p>
                      </div>
                      <div className="bg-navy-950/50 rounded-lg p-2.5 text-center">
                        <p className="text-navy-500 text-[9px]">Total</p>
                        <p className="text-cyan-400 font-bold text-sm mt-0.5">₱{plan.totalReturn.toLocaleString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedPlan(plan); setError(null); }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-accent-700/20 border border-cyan-500/30 text-cyan-400 font-semibold text-xs hover:from-cyan-500/30 hover:to-accent-700/30 transition-all duration-300 active:scale-[0.98]"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {selectedPlan && !success && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 rounded-t-3xl sm:rounded-3xl border border-navy-700 p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Confirm Investment</h3>
              <button onClick={() => setSelectedPlan(null)} className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center">
                <X size={16} className="text-navy-400" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4 animate-scale-in">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={`rounded-2xl bg-gradient-to-br ${selectedPlan.gradient} p-5 mb-4`}>
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = ICON_MAP[selectedPlan.icon];
                  return <Icon size={28} className="text-white" />;
                })()}
                <div>
                  <p className="text-white font-bold">{selectedPlan.name}</p>
                  <p className="text-white/70 text-xs">{selectedPlan.tag}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Investment Amount</span>
                  <span className="text-white font-semibold">₱{selectedPlan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Daily Returns</span>
                  <span className="text-white font-semibold">₱{selectedPlan.dailyReturn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Cycle Period</span>
                  <span className="text-white font-semibold">{selectedPlan.cycleDays} days</span>
                </div>
                <div className="h-px bg-white/20 my-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-white/80 font-medium">Total Returns</span>
                  <span className="text-white font-bold text-base">₱{selectedPlan.totalReturn.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {['Daily payouts to your balance', '31-day investment cycle', 'Cancel anytime after cycle'].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-navy-300 text-xs">{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleInvest}
              disabled={investing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-accent-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {investing ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Confirm Investment — ₱${selectedPlan.price.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-900 rounded-3xl border border-navy-700 p-8 text-center max-w-xs animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Investment Active!</h3>
            <p className="text-navy-400 text-sm mt-1.5">
              Your {selectedPlan.name} is now earning ₱{selectedPlan.dailyReturn.toLocaleString()} daily.
            </p>
            <button
              onClick={() => navigate('dashboard')}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-accent-600 text-white font-semibold text-sm active:scale-[0.98]"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
