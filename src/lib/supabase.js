import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nokfzkgqulhuyjotfeos.supabase.co'
const supabaseKey = 'sb_publishable_VoZqo8_CU-pc76pEBrMW6w_-W-D5fX4'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})