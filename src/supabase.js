import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Dito natin nilagay yung Project ID mo
const SUPABASE_URL = "https://vsccqgmnczxgtjzbauhz.supabase.co";

// ⚠️ ITO ANG KULANG: Kailangan mo pa ring kunin yung "Anon Key" mo
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzY2NxZ21uY3p4Z3RqemJhdWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDk0NTcsImV4cCI6MjEwODMyNTQ1N30.LSww2YTHt3GOPJAGaCcnKcL3qw7N2o_Xpkx54hG2kyY";
    

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);