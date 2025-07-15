export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          notes: string | null
          status: 'current' | 'completed' | 'pending'
          due_date: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          user_id: string
          category_id: string | null
          recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          recurrence_interval: number | null
          recurrence_end_date: string | null
          recurrence_max_occurrences: number | null
          parent_recurring_task_id: string | null
          is_recurring_instance: boolean
        }
        Insert: {
          id?: string
          title: string
          notes?: string | null
          status?: 'current' | 'completed' | 'pending'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          user_id: string
          category_id?: string | null
          recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          recurrence_interval?: number | null
          recurrence_end_date?: string | null
          recurrence_max_occurrences?: number | null
          parent_recurring_task_id?: string | null
          is_recurring_instance?: boolean
        }
        Update: {
          id?: string
          title?: string
          notes?: string | null
          status?: 'current' | 'completed' | 'pending'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          user_id?: string
          category_id?: string | null
          recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          recurrence_interval?: number | null
          recurrence_end_date?: string | null
          recurrence_max_occurrences?: number | null
          parent_recurring_task_id?: string | null
          is_recurring_instance?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_recurring_task_id_fkey"
            columns: ["parent_recurring_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      subtasks: {
        Row: {
          id: string
          title: string
          completed: boolean
          task_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          completed?: boolean
          task_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          completed?: boolean
          task_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      task_urls: {
        Row: {
          id: string
          url: string
          task_id: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          task_id: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          task_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_urls_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          email_notifications: boolean
          task_reminders: boolean
          weekly_summary: boolean
          theme_preference: 'light' | 'dark' | 'system'
          timezone: string
          date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          time_format: '12h' | '24h'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          task_reminders?: boolean
          weekly_summary?: boolean
          theme_preference?: 'light' | 'dark' | 'system'
          timezone?: string
          date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          time_format?: '12h' | '24h'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          task_reminders?: boolean
          weekly_summary?: boolean
          theme_preference?: 'light' | 'dark' | 'system'
          timezone?: string
          date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          time_format?: '12h' | '24h'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
      get_user_timezone: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
      get_user_start_of_day: {
        Args: {
          user_uuid: string
          target_date?: string
        }
        Returns: string
      }
      get_user_end_of_day: {
        Args: {
          user_uuid: string
          target_date?: string
        }
        Returns: string
      }
      is_today_in_user_timezone: {
        Args: {
          user_uuid: string
          check_timestamp: string
        }
        Returns: boolean
      }
      is_task_overdue_in_user_timezone: {
        Args: {
          user_uuid: string
          due_date: string
        }
        Returns: boolean
      }
      get_tasks_due_today: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          title: string
          notes: string | null
          due_date: string | null
          status: 'current' | 'completed' | 'pending'
          category_id: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          user_id: string
          recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          recurrence_interval: number | null
          recurrence_end_date: string | null
          recurrence_max_occurrences: number | null
          parent_recurring_task_id: string | null
          is_recurring_instance: boolean
        }[]
      }
      get_overdue_tasks: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          title: string
          notes: string | null
          due_date: string | null
          status: 'current' | 'completed' | 'pending'
          category_id: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          user_id: string
          recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null
          recurrence_interval: number | null
          recurrence_end_date: string | null
          recurrence_max_occurrences: number | null
          parent_recurring_task_id: string | null
          is_recurring_instance: boolean
        }[]
      }
      transition_daily_tasks: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
    }
    Enums: {
      task_status: 'current' | 'completed' | 'pending'
      recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}