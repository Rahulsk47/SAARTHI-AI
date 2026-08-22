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

const LOCAL_CHAT_KEY = 'saarthi_local_chat_messages_v2';
const GUEST_CONV_ID = 'guest-conv-1';

function getLocalMessages(): ChatMessageRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(msgs: ChatMessageRow[]) {
  try {
    localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(msgs));
  } catch (e) {
    console.error('Failed to save local chat:', e);
  }
}

export async function getOrCreateConversation(): Promise<Conversation | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      return {
        id: GUEST_CONV_ID,
        title: 'SAARTHI Assistant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

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
      console.warn('Falling back to local conversation:', error);
      return {
        id: GUEST_CONV_ID,
        title: 'SAARTHI Assistant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return created as Conversation;
  } catch {
    return {
      id: GUEST_CONV_ID,
      title: 'SAARTHI Assistant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export async function loadMessages(conversationId: string): Promise<ChatMessageRow[]> {
  try {
    if (conversationId === GUEST_CONV_ID) {
      return getLocalMessages();
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return getLocalMessages();
    }
    return data as ChatMessageRow[];
  } catch {
    return getLocalMessages();
  }
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<ChatMessageRow | null> {
  const newMsg: ChatMessageRow = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date().toISOString(),
  };

  if (conversationId === GUEST_CONV_ID) {
    const list = getLocalMessages();
    list.push(newMsg);
    saveLocalMessages(list);
    return newMsg;
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();

    if (error) {
      const list = getLocalMessages();
      list.push(newMsg);
      saveLocalMessages(list);
      return newMsg;
    }

    // Touch conversation updated_at
    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

    return data as ChatMessageRow;
  } catch {
    const list = getLocalMessages();
    list.push(newMsg);
    saveLocalMessages(list);
    return newMsg;
  }
}

export async function clearConversation(conversationId: string): Promise<void> {
  saveLocalMessages([]);
  if (conversationId !== GUEST_CONV_ID) {
    try {
      await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
    } catch {}
  }
}
