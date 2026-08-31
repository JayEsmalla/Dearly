export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      gifts: {
        Row: {
          builder_data: Json;
          created_at: string;
          expires_at: string | null;
          gift_type: string;
          id: string;
          management_token_hash: string;
          message: string;
          occasion: string;
          opened_at: string | null;
          opens_at: string | null;
          public_id: string;
          published_at: string | null;
          recipient_name: string;
          sender_name: string;
          status: "draft" | "wrapped" | "published" | "disabled";
          theme: "rose" | "wine" | "sage" | "gold";
          updated_at: string;
        };
        Insert: {
          builder_data?: Json;
          created_at?: string;
          expires_at?: string | null;
          gift_type: string;
          id?: string;
          management_token_hash: string;
          message: string;
          occasion: string;
          opened_at?: string | null;
          opens_at?: string | null;
          public_id: string;
          published_at?: string | null;
          recipient_name: string;
          sender_name: string;
          status?: "draft" | "wrapped" | "published" | "disabled";
          theme: "rose" | "wine" | "sage" | "gold";
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gifts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
