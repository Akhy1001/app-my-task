import { createClient } from '@supabase/supabase-js'

// Provide fallback strings during build time to prevent Vercel build crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxxx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
