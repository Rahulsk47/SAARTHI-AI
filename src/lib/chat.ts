import { supabase } from '@/lib/supabase';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export async function getOrCreateConversation(): Promise<Conversation | null> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return null;

  // Check for an existing conversation (most recent)
  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as Conversation;

  // Create a new one
  const { data: created, error } = await supabase
    .from('chat_conversations')
    .insert({ title: 'SAARTHI Assistant' })
    .select()
    .single();

  if (error) {
    console.error('Failed to create conversation:', error);
    return null;
  }
  return created as Conversation;
}

export async function loadMessages(conversationId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load messages:', error);
    return [];
  }
  return (data ?? []) as ChatMessageRow[];
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<ChatMessageRow | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  if (error) {
    console.error('Failed to save message:', error);
    return null;
  }

  // Touch conversation updated_at
  await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

  return data as ChatMessageRow;
}

export async function clearConversation(conversationId: string): Promise<void> {
  const { error } = await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
  if (error) console.error('Failed to clear conversation:', error);
}
