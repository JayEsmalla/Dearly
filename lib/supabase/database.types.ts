export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GiftStatus = "draft" | "wrapped" | "published" | "opened" | "replied" | "disabled";
type GiftTheme = "rose" | "wine" | "sage" | "gold";

export type Database = {
  public: {
    Tables: {
      gifts: {
        Row: {
          access_version: number;
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
