export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  balance: number;
  referral_code: string | null;
  referred_by: string | null;
  gcash_number: string | null;
  maya_number: string | null;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  plan_name: string;
  plan_amount: number;
  daily_return: number;
  cycle_days: number;
  start_date: string;
  end_date: string | null;
  status: string;
  total_earned: number;
  last_claim_date: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  bonus_amount: number;
  status: string;
  created_at: string;
}

export interface PlanProduct {
  id: string;
  name: string;
  price: number;
  dailyReturn: number;
  cycleDays: number;
  totalReturn: number;
  icon: string;
  color: string;
  gradient: string;
  tag: string;
}
