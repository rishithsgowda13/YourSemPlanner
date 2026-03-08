
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateChatResponse, generateEmbedding } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        console.log('Chat API called');
        const { message } = await req.json();
        const authHeader = req.headers.get('Authorization');

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        console.log('Auth Header present:', !!authHeader);

        // Create authenticated client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: authHeader || '',
                    },
                },
            }
        );

        // 1. Convert user question to embedding
        console.log('Generating embedding...');
        const embedding = await generateEmbedding(message);
        console.log('Embedding generated, length:', embedding.length);

        // 2. Find relevant notes using vector search (RPC function)
        console.log('Calling match_documents...');
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5, // adjust similarity threshold
            match_count: 5 // number of chunks to retrieve
        });

        if (error) {
            console.error('Supabase RPC Error:', error);
            return NextResponse.json({ error: `Database Search Error: ${error.message}` }, { status: 500 });
        }

        console.log('Documents found:', documents?.length || 0);

        // 3. Construct Context from retrieved chunks
        let contextText = '';
        if (documents && documents.length > 0) {
            contextText = documents.map((doc: any) => doc.content).join('\n\n---\n\n');
        } else {
            console.log('No relevant documents found, using empty context');
            contextText = 'No relevant notes found.';
        }

        // 4. Generate Answer with Context
        console.log('Generating chat response...');
        const answer = await generateChatResponse(message, contextText);
        console.log('Response generated');

        return NextResponse.json({ answer });

    } catch (error: any) {
        console.error('Chat Route Critical Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
