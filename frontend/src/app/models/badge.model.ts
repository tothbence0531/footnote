export interface Badge {
  id: number;
  name: string;
  image_url: string;
  obtained_at?: string;
  chain_tx_hash: string | null;
}
