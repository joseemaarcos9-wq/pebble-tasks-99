export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      custom_views: {
        Row: {
          color: string | null
          created_at: string | null
          filters: Json
          icon: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          filters: Json
          icon: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          filters?: Json
          icon?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_accounts: {
        Row: {
          arquivada: boolean | null
          cor: string | null
          created_at: string | null
          id: string
          moeda: string | null
          nome: string
          saldo_inicial: number | null
          tipo: Database["public"]["Enums"]["account_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivada?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          moeda?: string | null
          nome: string
          saldo_inicial?: number | null
          tipo: Database["public"]["Enums"]["account_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivada?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          moeda?: string | null
          nome?: string
          saldo_inicial?: number | null
          tipo?: Database["public"]["Enums"]["account_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_budgets: {
        Row: {
          alert_threshold_pct: number | null
          categoria_id: string
          created_at: string | null
          id: string
          mes_ano: string
          updated_at: string | null
          user_id: string
          valor_planejado: number
        }
        Insert: {
          alert_threshold_pct?: number | null
          categoria_id: string
          created_at?: string | null
          id?: string
          mes_ano: string
          updated_at?: string | null
          user_id: string
          valor_planejado: number
        }
        Update: {
          alert_threshold_pct?: number | null
          categoria_id?: string
          created_at?: string | null
          id?: string
          mes_ano?: string
          updated_at?: string | null
          user_id?: string
          valor_planejado?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_budgets_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          cor: string | null
          created_at: string | null
          id: string
          nome: string
          parent_id: string | null
          tipo: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Insert: {
          cor?: string | null
          created_at?: string | null
          id?: string
          nome: string
          parent_id?: string | null
          tipo: Database["public"]["Enums"]["category_type"]
          user_id: string
        }
        Update: {
          cor?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          parent_id?: string | null
          tipo?: Database["public"]["Enums"]["category_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_filter_presets: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_recurrences: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          conta_id: string
          created_at: string | null
          descricao: string | null
          dia_base: number
          frequencia: Database["public"]["Enums"]["recurrence_frequency"]
          id: string
          proxima_ocorrencia: string
          tags: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          conta_id: string
          created_at?: string | null
          descricao?: string | null
          dia_base: number
          frequencia: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          proxima_ocorrencia: string
          tags?: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          conta_id?: string
          created_at?: string | null
          descricao?: string | null
          dia_base?: number
          frequencia?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          proxima_ocorrencia?: string
          tags?: string | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_recurrences_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_recurrences_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_tags: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          anexo_url: string | null
          categoria_id: string | null
          conta_id: string
          created_at: string | null
          data: string
          descricao: string | null
          id: string
          meta: Json | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          tags: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          anexo_url?: string | null
          categoria_id?: string | null
          conta_id: string
          created_at?: string | null
          data: string
          descricao?: string | null
          id?: string
          meta?: Json | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          tags?: string | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          anexo_url?: string | null
          categoria_id?: string | null
          conta_id?: string
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          meta?: Json | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          tags?: string | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          task_id: string
          title: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          task_id: string
          title: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_lists: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          link: string | null
          list_id: string
          photos: string[] | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          link?: string | null
          list_id: string
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          link?: string | null
          list_id?: string
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      setup_user_defaults: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "carteira" | "banco" | "cartao"
      category_type: "despesa" | "receita"
      recurrence_frequency: "mensal" | "semanal" | "anual" | "custom"
      task_priority: "baixa" | "media" | "alta" | "urgente"
      task_status: "pendente" | "concluida"
      transaction_status: "pendente" | "compensada"
      transaction_type: "despesa" | "receita" | "transferencia"
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
      account_type: ["carteira", "banco", "cartao"],
      category_type: ["despesa", "receita"],
      recurrence_frequency: ["mensal", "semanal", "anual", "custom"],
      task_priority: ["baixa", "media", "alta", "urgente"],
      task_status: ["pendente", "concluida"],
      transaction_status: ["pendente", "compensada"],
      transaction_type: ["despesa", "receita", "transferencia"],
    },
  },
} as const
