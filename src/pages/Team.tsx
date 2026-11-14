import { useEffect, useState } from 'react';
import {
  Users, Copy, Check, Gift, UserCheck, Share2, Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Referral } from '@/types';
import { REFERRAL_BONUS_RATE } from '@/data/plans';

export default function Team() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [totalBonus, setTotalBonus] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setReferrals(data as Referral[]);
            const bonus = data.reduce((sum, r) => sum + Number(r.bonus_amount), 0);
            setTotalBonus(bonus);
          }
        });
    }
  }, [profile?.id]);

  const copyCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareCode = () => {
    if (profile?.referral_code && navigator.share) {
      navigator.share({
        title: 'Join Vantrex',
        text: `Use my referral code ${profile.referral_code} to join Vantrex and start investing!`,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      copyCode();
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-xl border-b border-navy-800/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">My Team</h1>
              <p className="text-[10px] text-navy-400 mt-0.5">Invite friends and earn 20% bonus</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 space-y-5">
        {/* Referral Code Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-700/10 border border-amber-500/30 p-5 overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Gift size={18} className="text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Your Referral Code</span>
            </div>
            <div className="flex items-center justify-between bg-navy-950/60 rounded-xl p-4 mb-4">
              <span className="text-2xl font-bold text-white tracking-widest">
                {profile?.referral_code || '------'}
              </span>
              <button
                onClick={copyCode}
                className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-all active:scale-90"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-amber-400" />}
              </button>
            </div>
            <button
              onClick={shareCode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-[0.98]"
            >
              <Share2 size={16} />
              Share Code
            </button>
            <p className="text-navy-400 text-[11px] mt-3 text-center">
              Earn {REFERRAL_BONUS_RATE * 100}% of your referral's investment
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-100">
          <div className="bg-navy-900 rounded-2xl p-4 border border-navy-800 text-center">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
              <UserCheck size={20} className="text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{referrals.length}</p>
            <p className="text-navy-500 text-[10px] mt-0.5">Total Invited</p>
          </div>
          <div className="bg-navy-900 rounded-2xl p-4 border border-navy-800 text-center">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
              <Award size={20} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              ₱{totalBonus.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-navy-500 text-[10px] mt-0.5">Referral Bonus</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-navy-900 rounded-2xl p-5 border border-navy-800 animate-fade-in-up delay-200">
          <h3 className="text-white font-semibold text-sm mb-4">How Referrals Work</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Share your code', desc: 'Send your referral code to friends' },
              { step: '2', title: 'They sign up', desc: 'Your friend creates an account using your code' },
              { step: '3', title: 'They invest', desc: 'When they buy a plan, you earn 20% bonus' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{item.step}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-navy-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral List */}
        <div className="animate-fade-in-up delay-300">
          <h3 className="text-white font-semibold text-sm mb-3">Invited Members</h3>
          {referrals.length === 0 ? (
            <div className="bg-navy-900 rounded-2xl p-8 border border-navy-800 text-center">
              <div className="w-14 h-14 rounded-full bg-navy-800 flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-navy-600" />
              </div>
              <p className="text-navy-400 text-sm">No referrals yet</p>
              <p className="text-navy-600 text-xs mt-1">Share your code to start earning</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((ref, i) => (
                <div
                  key={ref.id}
                  className="bg-navy-900 rounded-xl p-3.5 border border-navy-800 flex items-center gap-3 animate-slide-in-right"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-accent-600/30 flex items-center justify-center">
                    <Users size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Member #{i + 1}</p>
                    <p className="text-navy-500 text-[10px]">{new Date(ref.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 text-sm font-semibold">
                      +₱{Number(ref.bonus_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      ref.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
