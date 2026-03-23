export interface User {
  id: string;
  email: string;
  username: string;
  points?: number;
  createdAt?: string;
}

export interface getMeResponse {
  success: boolean;
  data: {
    userId: string;
    iat: number;
    exp: number;
  };
}

export interface Me {
  userId: string;
  iat: number;
  exp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  points: number;
  wallet_address: string | null;
  created_at: string;
}
