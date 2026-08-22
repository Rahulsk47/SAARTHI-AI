import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      accessibility_preferences: {
        Row: {
          id: string;
          user_id: string;
          font_scale: number;
          high_contrast: boolean;
          letter_spacing: number;
          word_spacing: number;
          line_height: number;
          simple_language: boolean;
          large_controls: boolean;
          reduce_motion: boolean;
          language: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          font_scale?: number;
          high_contrast?: boolean;
          letter_spacing?: number;
          word_spacing?: number;
          line_height?: number;
          simple_language?: boolean;
          large_controls?: boolean;
          reduce_motion?: boolean;
          language?: string;
        };
        Update: Partial<Database['public']['Tables']['accessibility_preferences']['Insert']>;
      };
      website_analyses: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          score: number;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          score?: number;
          summary?: string;
        };
        Update: Partial<Database['public']['Tables']['website_analyses']['Insert']>;
      };
      website_issues: {
        Row: {
          id: string;
          analysis_id: string;
          title: string;
          severity: string;
          category: string;
          description: string;
          recommendation: string;
          wcag: string;
          count: number;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          title: string;
          severity: string;
          category: string;
          description: string;
          recommendation: string;
          wcag: string;
          count: number;
        };
        Update: Partial<Database['public']['Tables']['website_issues']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          summary: string;
          important_dates: { date: string; event: string }[];
          eligibility: string[];
          required_documents: string[];
          important_info: string[];
          next_steps: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          summary?: string;
          important_dates?: { date: string; event: string }[];
          eligibility?: string[];
          required_documents?: string[];
          important_info?: string[];
          next_steps?: string[];
        };
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      chat_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
        };
        Update: {
          title?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          detail: string;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          detail: string;
          score?: number | null;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
      };
    };
  };
};
