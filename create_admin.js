const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oghqbrtfcmrmucqgehkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naHFicnRmY21ybXVjcWdlaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzA2OTksImV4cCI6MjA5MTAwNjY5OX0.30PI9RTwqtxpKDSQdFhB9pExEV-gTnKDztm0mn8B1_A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'WAVE_SURF_CLUB@outlook.com',
    password: 'WAVESURF2026',
    options: {
      data: {
        nombre: 'Admin',
        apellido: 'Wave Surf',
        rut: '11111111-1'
      }
    }
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data.user.id);
  }
}

main();
