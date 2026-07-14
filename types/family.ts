export type Family = {
  id: string;
  name: string;
  inviteCode: string;
};

export type DbFamily = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
};

export type DbExpense = {
  id: string;
  family_id: string;
  amount: string;
  category_id: string;
  date: string;
  note: string;
  scope: 'family' | 'personal';
  spender_name: string;
  created_at: string;
};
