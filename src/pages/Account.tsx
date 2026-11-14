import { useEffect, useState } from 'react';
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, History, User as UserIcon,
  CreditCard, Smartphone, LogOut, X, Check, AlertCircle, Plus, Minus,
  ChevronDown, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types';

type ModalType = 'deposit' | 'withdraw' | 'bindGcash' | 'bindMaya' | null;

export default function Account() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [amount, setAmount] = useState('');
  const [bindNumber, setBindNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data }) => {
          if (data) setTransactions(data as Transaction[]);
        });
    }
  }, [profile?.id]);

  const closeModal = () => {
    setModal(null);
    setAmount('');
    setBindNumber('');
    setError(null);
    setSuccess(null);
  };

  const handleDeposit = async () => {
    if (!profile || !amount) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'deposit',
        amount: val,
        status: 'pending',
        description: 'Deposit request (pending confirmation)',
      });
      if (txError) throw txError;
      setSuccess('Deposit request submitted! It will be credited after confirmation.');
      setTimeout(closeModal, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!profile || !amount) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (val > Number(profile.balance)) {
      setError('Insufficient balance');
      return;
    }
    if (!profile.gcash_number && !profile.maya_number) {
      setError('Please bind a GCash or Maya account first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'withdraw',
        amount: val,
        status: 'pending',
        description: 'Withdrawal request (pending processing)',
      });
      if (txError) throw txError;
      setSuccess('Withdrawal request submitted! Funds will be sent to your account.');
      setTimeout(closeModal, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleBind = async () => {
    if (!profile || !bindNumber) return;
    if (bindNumber.replace(/\D/g, '').length < 10) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const field = modal === 'bindGcash' ? 'gcash_number' : 'maya_number';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: bindNumber })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      await refreshProfile();
      setSuccess(modal === 'bindGcash' ? 'GCash account linked!' : 'Maya account linked!');
      setTimeout(closeModal, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bind account');
    } finally {
      setLoading(false);
    }
  };

  const getTxIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'deposit': return ArrowDownCircle;
      case 'withdraw': return ArrowUpCircle;
      case 'investment': return Minus;
      case 'referral_bonus': return Plus;
      case 'daily_earning': return Plus;
      default: return History;
    }
  };

  const getTxColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-emerald-400 bg-emerald-500/10';
      case 'withdraw': return 'text-orange-400 bg-orange-500/10';
      case 'investment': return 'text-cyan-400 bg-cyan-500/10';
      case 'referral_bonus': return 'text-amber-400 bg-amber-500/10';
      case 'daily_earning': return 'text-emerald-400 bg-emerald-500/10';
      default: return 'text-navy-400 bg-navy-800';
    }
  };

  const formatTxType = (type: string) => {
    return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const modalTitle = {
    deposit: 'Deposit Funds',
    withdraw: 'Withdraw Funds',
    bindGcash: 'Bind GCash Account',
    bindMaya: 'Bind Maya Account',
  }[modal as Exclude<ModalType, null>];

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-xl border-b border-navy-800/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-accent-600 flex items-center justify-center">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">My Account</h1>
              <p className="text-[10px] text-navy-400 mt-0.5">{profile?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-5 space-y-5">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl border border-navy-700/50 p-5 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-accent-600 flex items-center justify-center">
              <UserIcon size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">{profile?.username || 'Investor'}</p>
              <p className="text-navy-400 text-xs">{profile?.email}</p>
              <p className="text-cyan-400 text-[10px] mt-1">Referral: {profile?.referral_code}</p>
            </div>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="relative rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-navy-700/50 p-5 overflow-hidden animate-fade-in-up delay-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-300 text-xs font-medium">Current Balance</span>
              <Wallet size={16} className="text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight mb-4">
              ₱{Number(profile?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setModal('deposit'); setError(null); }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <ArrowDownCircle size={20} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Deposit</span>
              </button>
              <button
                onClick={() => { setModal('withdraw'); setError(null); }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all active:scale-[0.98]"
              >
                <ArrowUpCircle size={20} className="text-orange-400" />
                <span className="text-orange-400 text-xs font-semibold">Withdraw</span>
              </button>
            </div>
            <p className="text-navy-500 text-[10px] mt-3 text-center">
              Deposit & withdrawal processing will be available once payment integration is set up
            </p>
          </div>
        </div>

        {/* Bind Accounts */}
        <div className="animate-fade-in-up delay-200">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-cyan-400" />
            Linked Accounts
          </h3>
          <div className="space-y-2.5">
            <button
              onClick={() => { setModal('bindGcash'); setBindNumber(profile?.gcash_number || ''); setError(null); }}
              className="w-full bg-navy-900 rounded-xl p-4 border border-navy-800 flex items-center gap-3 hover:border-cyan-500/30 transition-all active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Smartphone size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">GCash</p>
                <p className="text-navy-500 text-xs">{profile?.gcash_number || 'Not linked'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                profile?.gcash_number ? 'bg-emerald-500/10 text-emerald-400' : 'bg-navy-800 text-navy-400'
              }`}>
                {profile?.gcash_number ? 'Linked' : 'Link'}
              </span>
            </button>
            <button
              onClick={() => { setModal('bindMaya'); setBindNumber(profile?.maya_number || ''); setError(null); }}
              className="w-full bg-navy-900 rounded-xl p-4 border border-navy-800 flex items-center gap-3 hover:border-cyan-500/30 transition-all active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
                <Smartphone size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">Maya</p>
                <p className="text-navy-500 text-xs">{profile?.maya_number || 'Not linked'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                profile?.maya_number ? 'bg-emerald-500/10 text-emerald-400' : 'bg-navy-800 text-navy-400'
              }`}>
                {profile?.maya_number ? 'Linked' : 'Link'}
              </span>
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="animate-fade-in-up delay-300">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <History size={16} className="text-cyan-400" />
              Transaction History
              {transactions.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-navy-800 text-navy-400 text-[10px] font-medium">
                  {transactions.length}
                </span>
              )}
            </h3>
            <div className={`flex items-center gap-1 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>
              <ChevronDown size={18} className="text-navy-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </button>

          {showHistory && (
            <>
              {transactions.length === 0 ? (
                <div className="bg-navy-900 rounded-2xl p-8 border border-navy-800 text-center animate-fade-in-up">
                  <div className="w-14 h-14 rounded-full bg-navy-800 flex items-center justify-center mx-auto mb-3">
                    <History size={24} className="text-navy-600" />
                  </div>
                  <p className="text-navy-400 text-sm">No transactions yet</p>
                  <p className="text-navy-600 text-xs mt-1">Your activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in-up">
                  {transactions.map((tx, i) => {
                const TxIcon = getTxIcon(tx.type);
                const isPositive = ['deposit', 'referral_bonus', 'daily_earning'].includes(tx.type);
                return (
                  <div
                    key={tx.id}
                    className="bg-navy-900 rounded-xl p-3.5 border border-navy-800 flex items-center gap-3 animate-slide-in-right"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTxColor(tx.type)}`}>
                      <TxIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{formatTxType(tx.type)}</p>
                      <p className="text-navy-500 text-[10px] truncate">{tx.description || '-'}</p>
                      <p className="text-navy-600 text-[10px]">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {isPositive ? '+' : '-'}₱{Number(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400'
                        : tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="w-full py-3.5 rounded-xl bg-navy-900 border border-navy-800 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-[0.98] animate-fade-in-up delay-400"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 rounded-t-3xl sm:rounded-3xl border border-navy-700 p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{modalTitle}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center">
                <X size={16} className="text-navy-400" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4 animate-scale-in">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-4 animate-scale-in">
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            {(modal === 'deposit' || modal === 'withdraw') && (
              <>
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-medium text-navy-300 ml-1">
                    Amount (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-500 font-medium">₱</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-9 pr-4 py-3.5 text-white placeholder:text-navy-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-lg font-semibold"
                    />
                  </div>
                  {modal === 'withdraw' && (
                    <p className="text-navy-500 text-[11px] ml-1 mt-1">
                      Available: ₱{Number(profile?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                <button
                  onClick={modal === 'deposit' ? handleDeposit : handleWithdraw}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 ${
                    modal === 'deposit'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                      : 'bg-gradient-to-r from-orange-500 to-red-600'
                  }`}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    modal === 'deposit' ? 'Submit Deposit' : 'Submit Withdrawal'
                  )}
                </button>
              </>
            )}

            {(modal === 'bindGcash' || modal === 'bindMaya') && (
              <>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-navy-950/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    modal === 'bindGcash' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-emerald-500 to-green-700'
                  }`}>
                    <Smartphone size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {modal === 'bindGcash' ? 'GCash Account' : 'Maya Account'}
                    </p>
                    <p className="text-navy-500 text-xs">Enter your registered mobile number</p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-medium text-navy-300 ml-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={bindNumber}
                    onChange={(e) => setBindNumber(e.target.value)}
                    placeholder="09XXXXXXXXX"
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-3.5 text-white placeholder:text-navy-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                  />
                </div>
                <button
                  onClick={handleBind}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-accent-600 text-white font-semibold active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Link Account'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
