'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Upload, MessageSquare, FileText, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { uploadNote, deleteNote } from './actions';

interface Note {
    id: string;
    title: string;
    created_at: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function NotesPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [notes, setNotes] = useState<Note[]>([]);
    const [uploading, setUploading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! Upload your study notes and ask me anything about them.' }
    ]);

    useEffect(() => {
        if (user) fetchNotes();
    }, [user]);

    const fetchNotes = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setNotes(data);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: 'Error', description: 'File too large (Max 5MB)', variant: 'destructive' });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        // Get current session token for RLS
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            formData.append('access_token', session.access_token);
        }

        try {
            const result = await uploadNote(formData);
            if (result.error) throw new Error(result.error);

            toast({ title: 'Success', description: 'Note processed and embedded!' });
            fetchNotes();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteNote(id);
        if (result.success) {
            toast({ title: 'Deleted', description: 'Note removed.' });
            fetchNotes();
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || chatLoading) return;

        const userMsg = inputMessage;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputMessage('');
        setChatLoading(true);

        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to get answer', variant: 'destructive' });
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 h-[calc(100vh-100px)]">
            {/* Left: Notes Manager */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-xl">
                        <span className="flex items-center gap-2">
                            <FileText className="h-6 w-6 text-blue-600" />
                            My Notes
                        </span>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".txt,.pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                            <Button disabled={uploading} variant="outline" size="sm">
                                {uploading ? 'Processing...' : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload PDF/TXT
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        {notes.length === 0 ? (
                            <div className="text-center text-muted-foreground mt-20">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No notes uploaded yet.</p>
                                <p className="text-sm">Upload a PDF or Text file to start chatting!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notes.map(note => (
                                    <div key={note.id} className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-background p-2 rounded-full shadow-sm">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div className="truncate">
                                                <p className="font-medium truncate">{note.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Right: AI Chat Interface */}
            <Card className="flex flex-col h-full border-border shadow-md">
                <CardHeader className="bg-muted border-b">
                    <CardTitle className="flex items-center gap-2 text-xl text-blue-400">
                        <MessageSquare className="h-6 w-6" />
                        AI Study Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    {/* Chat History */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-xl shadow-sm text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-muted border border-border rounded-bl-none text-foreground'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted border border-border p-4 rounded-xl rounded-bl-none text-sm text-muted-foreground animate-pulse">
                                        Thinking... 🤖
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-background border-t border-border">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask a question from your notes..."
                                disabled={chatLoading}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={chatLoading || !inputMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
