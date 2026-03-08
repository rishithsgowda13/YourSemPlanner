
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function getEnvVar(key) {
    const content = fs.readFileSync('.env.local', 'utf8');
    const match = content.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local');
    process.exit(1);
}

console.log(`URL: "${supabaseUrl}" (Length: ${supabaseUrl.length})`);
console.log(`Key: "${supabaseAnonKey.substring(0, 10)}..." (Length: ${supabaseAnonKey.length})`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    console.log('URL:', supabaseUrl);

    try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);

        if (error) {
            console.error('Connection failed:', error);
            if (error.message && error.message.includes('fetch')) {
                console.error('Suggestion: Check your internet connection or if the Supabase project is active.');
            }
        } else {
            console.log('Connection successful! Supabase is reachable.', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

testConnection();
