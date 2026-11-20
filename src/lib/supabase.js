import { createClient } from '@supabase/supabase-js';

// =============================================
// WAVE SURF CLUB — Supabase Connection
// Proyecto: Wave Surf Club Oficial
// =============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://keaoaxltnbdxysysxxem.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ocGuCM8lYlagcH33oPATxw_KMdZE9nb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConnected = () => true;
