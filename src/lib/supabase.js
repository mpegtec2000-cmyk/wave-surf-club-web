import { createClient } from '@supabase/supabase-js';

// =============================================
// WAVE SURF CLUB — Supabase Connection
// Proyecto: Wave Surf Club Oficial
// =============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oghqbrtfcmrmucqgehkc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naHFicnRmY21ybXVjcWdlaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzA2OTksImV4cCI6MjA5MTAwNjY5OX0.30PI9RTwqtxpKDSQdFhB9pExEV-gTnKDztm0mn8B1_A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConnected = () => true;
