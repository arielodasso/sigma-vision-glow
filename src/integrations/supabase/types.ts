export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published: boolean | null
          published_at: string | null
          related_service: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          related_service?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          related_service?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          accepted_at: string | null
          billing: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          created_at: string
          delivery_time: string | null
          development_cost: number | null
          id: string
          items: Json
          monthly_maintenance_cost: number | null
          observations: string | null
          payment_method: string | null
          scope: string | null
          slug: string
          status: Database["public"]["Enums"]["budget_status"]
          updated_at: string
          work_type: string | null
        }
        Insert: {
          accepted_at?: string | null
          billing?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          delivery_time?: string | null
          development_cost?: number | null
          id?: string
          items?: Json
          monthly_maintenance_cost?: number | null
          observations?: string | null
          payment_method?: string | null
          scope?: string | null
          slug: string
          status?: Database["public"]["Enums"]["budget_status"]
          updated_at?: string
          work_type?: string | null
        }
        Update: {
          accepted_at?: string | null
          billing?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          delivery_time?: string | null
          development_cost?: number | null
          id?: string
          items?: Json
          monthly_maintenance_cost?: number | null
          observations?: string | null
          payment_method?: string | null
          scope?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["budget_status"]
          updated_at?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_channel_members: {
        Row: {
          channel_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_channels: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          channel_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          channel_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          channel_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          }
        ]
      }
      client_invites: {
        Row: {
          accepted_at: string | null
          client_id: string
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string
          status: Database["public"]["Enums"]["client_invite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string
          status?: Database["public"]["Enums"]["client_invite_status"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string
          status?: Database["public"]["Enums"]["client_invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          portal_enabled: boolean
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          portal_enabled?: boolean
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          portal_enabled?: boolean
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          attempts: number
          company: string | null
          created_at: string
          email: string
          error_message: string | null
          id: string
          message: string
          name: string
          resend_message_ids: Json | null
          service: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          user_agent: string | null
          whatsapp: string | null
        }
        Insert: {
          attempts?: number
          company?: string | null
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          message: string
          name: string
          resend_message_ids?: Json | null
          service?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_agent?: string | null
          whatsapp?: string | null
        }
        Update: {
          attempts?: number
          company?: string | null
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          message?: string
          name?: string
          resend_message_ids?: Json | null
          service?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_agent?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      crm_settings: {
        Row: {
          category: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          category?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mime_type: string | null
          name: string
          path: string
          size_bytes: number | null
          url: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mime_type?: string | null
          name: string
          path: string
          size_bytes?: number | null
          url?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          path?: string
          size_bytes?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      help_docs: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          mime_type: string | null
          name: string
          path: string
          size_bytes: number | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          name: string
          path: string
          size_bytes?: number | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          name?: string
          path?: string
          size_bytes?: number | null
          url?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          description: string | null
        }
        Insert: {
          code: string
          description?: string | null
        }
        Update: {
          code?: string
          description?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          manager_id: string | null
          phone: string | null
          title: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          manager_id?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          manager_id?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      role_permissions: {
        Row: {
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_fkey"
            columns: ["permission"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          }
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          content: string
          created_at: string
          id: string
          name: string
          published: boolean
          rating: number | null
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          company?: string | null
          content: string
          created_at?: string
          id?: string
          name: string
          published?: boolean
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_invite_accept: {
        Args: { _token: string }
        Returns: undefined
      }
      client_portal_budgets: {
        Args: { _token: string }
        Returns: {
          accepted_at: string | null
          billing: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          created_at: string
          delivery_time: string | null
          development_cost: number | null
          id: string
          items: Json
          monthly_maintenance_cost: number | null
          observations: string | null
          payment_method: string | null
          scope: string | null
          slug: string
          status: Database["public"]["Enums"]["budget_status"]
          updated_at: string
          work_type: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "budgets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      client_portal_documents: {
        Args: { _token: string }
        Returns: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mime_type: string | null
          name: string
          path: string
          size_bytes: number | null
          url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      client_portal_info: {
        Args: { _token: string }
        Returns: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          portal_enabled: boolean
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          whatsapp: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "clients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_budget_by_slug: {
        Args: { _slug: string }
        Returns: {
          accepted_at: string | null
          billing: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          created_at: string
          delivery_time: string | null
          development_cost: number | null
          id: string
          items: Json
          monthly_maintenance_cost: number | null
          observations: string | null
          payment_method: string | null
          scope: string | null
          slug: string
          status: Database["public"]["Enums"]["budget_status"]
          updated_at: string
          work_type: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "budgets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_my_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: { _perm: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_backoffice: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: { _user_id: string }
        Returns: boolean
      }
      set_budget_status: {
        Args: {
          _slug: string
          _status: Database["public"]["Enums"]["budget_status"]
        }
        Returns: undefined
      }
      tasks_set_created_by: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "empleado" | "moderator" | "superadmin" | "user"
      budget_status: "accepted" | "draft" | "rejected" | "sent"
      client_invite_status: "accepted" | "pending" | "revoked"
      client_status: "active" | "lost" | "pending_payment" | "proposal"
      contact_status: "failed" | "pending" | "sent"
      task_priority: "high" | "low" | "medium" | "urgent"
      task_status: "cancelled" | "done" | "in_progress" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "empleado", "moderator", "superadmin", "user"],
      budget_status: ["draft", "sent", "accepted", "rejected"],
      client_invite_status: ["pending", "accepted", "revoked"],
      client_status: ["proposal", "active", "pending_payment", "lost"],
      contact_status: ["pending", "sent", "failed"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "done", "cancelled"],
    },
  },
} as const