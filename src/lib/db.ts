import { getRequestContext } from '@cloudflare/next-on-pages';

export interface Order {
  id: string;
  customer_name: string;
  customer_whatsapp: string;
  dtf_type: 'textil' | 'uv';
  notes: string | null;
  status: 'pending' | 'processing' | 'ready' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OrderFile {
  id: string;
  order_id: string;
  file_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface CloudflareEnv {
  DB: D1Database;
}

export function getDB(): D1Database {
  const ctx = getRequestContext();
  return (ctx.env as CloudflareEnv).DB;
}
