const https = require('https');
const fs = require('fs');
const path = require('path');

const envPathRoot = path.resolve(__dirname, '.env.local');
let apiKey = null;

try {
    const envContent = fs.readFileSync(envPathRoot, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('GEMINI_API_KEY=')) {
            apiKey = line.split('=')[1].trim();
            break;
        }
    }
} catch (e) {
    console.error("Could not read .env.local", e);
}

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

console.log(`Checking models for API Key: ${apiKey.substring(0, 5)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API returned error:");
                console.error(JSON.stringify(json.error, null, 2));
            } else if (json.models) {
                console.log("✅ Models loaded successfully. Available:");
                json.models.forEach(m => {
                    console.log(` - ${m.name}`);
                });
            } else {
                console.log("No models found in response.");
                console.log(data);
            }
        } catch (e) {
            console.error("Failed to parse response", e);
            console.log("Raw response:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request error", e);
});
