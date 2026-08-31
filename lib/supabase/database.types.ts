export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GiftStatus = "draft" | "wrapped" | "published" | "opened" | "replied" | "disabled" | "archived";
type GiftTheme = "rose" | "wine" | "sage" | "gold";

export type Database = {
  public: {
    Tables: {
      gifts: {
        Row: {
          access_version: number;
          archived_from_status: Exclude<GiftStatus, "archived"> | null;
          builder_data: Json;
          claimed_at: string | null;
          created_at: string;
          expires_at: string | null;
          gift_type: string;
          id: string;
          management_token_hash: string;
          message: string;
          occasion: string;
          opened_at: string | null;
          opens_at: string | null;
          owner_id: string | null;
          pin_hash: string | null;
          pin_salt: string | null;
          public_id: string;
          published_at: string | null;
          recipient_name: string;
          sender_name: string;
          status: GiftStatus;
          theme: GiftTheme;
          updated_at: string;
        };
        Insert: {
          access_version?: number;
          archived_from_status?: Exclude<GiftStatus, "archived"> | null;
          builder_data?: Json;
          claimed_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          gift_type: string;
          id?: string;
          management_token_hash: string;
          message: string;
          occasion: string;
          opened_at?: string | null;
          opens_at?: string | null;
          owner_id?: string | null;
          pin_hash?: string | null;
          pin_salt?: string | null;
          public_id: string;
          published_at?: string | null;
          recipient_name: string;
          sender_name: string;
          status?: GiftStatus;
          theme: GiftTheme;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gifts"]["Insert"]>;
        Relationships: [];
      };
      gift_templates: {
        Row: {
          builder_data: Json;
          created_at: string;
          gift_type: string;
          id: string;
          name: string;
          occasion: string | null;
          owner_id: string;
          source_gift_id: string | null;
          theme: GiftTheme;
          updated_at: string;
        };
        Insert: {
          builder_data?: Json;
          created_at?: string;
          gift_type: string;
          id?: string;
          name: string;
          occasion?: string | null;
          owner_id: string;
          source_gift_id?: string | null;
          theme: GiftTheme;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gift_templates"]["Insert"]>;
        Relationships: [];
      };
      gift_media: {
        Row: {
          bytes: number;
          caption: string | null;
          created_at: string;
          gift_id: string;
          height: number | null;
          id: string;
          media_type: "image" | "background_audio" | "voice";
          mime_type: string;
          sort_order: number;
          storage_path: string;
          thumbnail_path: string | null;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          bytes: number;
          caption?: string | null;
          created_at?: string;
          gift_id: string;
          height?: number | null;
          id?: string;
          media_type: "image" | "background_audio" | "voice";
          mime_type: string;
          sort_order?: number;
          storage_path: string;
          thumbnail_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["gift_media"]["Insert"]>;
        Relationships: [];
      };
      gift_responses: {
        Row: {
          created_at: string;
          gift_id: string;
          reaction: "This made me smile." | "I love this." | "This is so thoughtful." | "You made my day." | null;
          reply: string | null;
          response_token_hash: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          gift_id: string;
          reaction?: "This made me smile." | "I love this." | "This is so thoughtful." | "You made my day." | null;
          reply?: string | null;
          response_token_hash: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gift_responses"]["Insert"]>;
        Relationships: [];
      };
      gift_response_attempts: {
        Row: {
          attempted_at: string;
          client_hash: string;
          gift_id: string;
          id: number;
        };
        Insert: {
          attempted_at?: string;
          client_hash: string;
          gift_id: string;
          id?: never;
        };
        Update: Partial<Database["public"]["Tables"]["gift_response_attempts"]["Insert"]>;
        Relationships: [];
      };
      gift_access_attempts: {
        Row: {
          attempted_at: string;
          client_hash: string;
          gift_id: string;
          id: number;
        };
        Insert: {
          attempted_at?: string;
          client_hash: string;
          gift_id: string;
          id?: never;
        };
        Update: Partial<Database["public"]["Tables"]["gift_access_attempts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
