const { GoogleGenerativeAI } = require("@google/generative-ai");
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

console.log(`Using API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = ["gemini-1.5-flash", "gemini-pro"];

async function test() {
    console.log("Starting Model Test...");
    for (const model of modelsToTest) {
        console.log(`\nTesting ${model}...`);
        try {
            const m = genAI.getGenerativeModel({ model: model });
            const result = await m.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${model} works!`);
            console.log(response.text());
            return;
        } catch (error) {
            console.log(`❌ FAILED: ${model}`);
            console.error("Error details:", error.message);
            // console.error(JSON.stringify(error, null, 2));
        }
    }
}

test();
