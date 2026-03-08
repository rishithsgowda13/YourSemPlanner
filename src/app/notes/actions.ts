'use server';

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/gemini';
import pdf from 'pdf-parse';
import { revalidatePath } from 'next/cache';

export async function uploadNote(formData: FormData) {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const accessToken = formData.get('access_token') as string;

    if (!file || !userId || !accessToken) {
        return { error: 'Missing file, user ID, or access token' };
    }

    try {
        console.log('Upload Action Started');
        // Create authenticated client
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            }
        );

        // 1. Extract Text
        console.log('Extracting text from file...');
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let text = '';

        if (file.type === 'application/pdf') {
            console.log('Parsing PDF...');
            try {
                const data = await pdf(buffer);
                text = data.text;
                console.log('PDF parsed successfully, text length:', text.length);
            } catch (pdfErr) {
                console.error('PDF Parse Error:', pdfErr);
                throw new Error('Failed to parse PDF file');
            }
        } else {
            text = buffer.toString('utf-8');
            console.log('Text file read, length:', text.length);
        }

        // Clean text
        text = text.replace(/\s+/g, ' ').trim();

        if (text.length < 50) {
            return { error: 'File content is too short' };
        }

        // 2. Save Note Metadata
        console.log('Saving note metadata to Supabase...');
        const { data: note, error: noteError } = await supabaseAuth
            .from('notes')
            .insert({
                user_id: userId,
                title: file.name,
                file_path: 'local',
                file_size: file.size,
            })
            .select()
            .single();

        if (noteError) {
            console.error('Supabase Insert Error:', noteError);
            throw new Error(noteError.message);
        }
        console.log('Note saved with ID:', note.id);

        // 3. Chunk Text & Generate Embeddings
        const chunks = splitIntoChunks(text, 1000);
        console.log(`Split into ${chunks.length} chunks. Generating embeddings...`);

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);

            await supabaseAuth.from('note_chunks').insert({
                note_id: note.id,
                content: chunk,
                embedding: embedding,
            });
        }
        console.log('Embeddings generated and saved.');

        revalidatePath('/notes');
        return { success: true };
    } catch (error: any) {
        console.error('Upload Error:', error);
        return { error: error.message || 'Failed to process note' };
    }
}

export async function deleteNote(noteId: string) {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) return { error: error.message };
    revalidatePath('/notes');
    return { success: true };
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}
