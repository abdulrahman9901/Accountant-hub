export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Job {
  id: number;
  title: string;
  company_name: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  posted_date: string;
  status: 'open' | 'closed';
  bids_count: number;
  category?: Category;
}

export interface Bid {
  id: number;
  job_id: number;
  user_id: number;
  proposed_price: number | string;
  estimated_delivery_days: number;
  cover_letter: string;
  experience_summary: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  job?: Job;
  user?: User;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
