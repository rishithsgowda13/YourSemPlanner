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

const genAI = new GoogleGenerativeAI(apiKey);

async function testEmbedding() {
    const modelName = "text-embedding-004";
    console.log(`Testing embedding with ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent("Hello world");
        console.log(`✅ SUCCESS: ${modelName} works!`);
        console.log(`Embedding length: ${result.embedding.values.length}`);
    } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        console.error(error.message);
    }
}

testEmbedding();
