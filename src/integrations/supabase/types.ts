export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          created_at: string | null
          description: string | null
          icon_name: string
          id: string
          points_required: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          achievement_type?: string
          created_at?: string | null
          description?: string | null
          icon_name?: string
          id?: string
          points_required?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          achievement_type?: string
          created_at?: string | null
          description?: string | null
          icon_name?: string
          id?: string
          points_required?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_attempts: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          questions_answered: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          questions_answered?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          questions_answered?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      module_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          is_flagged: boolean | null
          module_progress_id: string | null
          question_id: string | null
          selected_answer: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          module_progress_id?: string | null
          question_id?: string | null
          selected_answer?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          module_progress_id?: string | null
          question_id?: string | null
          selected_answer?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_answers_module_progress_id_fkey"
            columns: ["module_progress_id"]
            isOneToOne: false
            referencedRelation: "module_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string | null
          score: number | null
          session_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["module_status"] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          score?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["module_status"] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          score?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["module_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "test_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_questions: {
        Row: {
          created_at: string
          id: string
          module_id: string | null
          question_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module_id?: string | null
          question_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "test_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      module_topics: {
        Row: {
          created_at: string
          id: string
          module_id: string | null
          percentage: number
          question_count: number
          topic_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module_id?: string | null
          percentage?: number
          question_count?: number
          topic_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string | null
          percentage?: number
          question_count?: number
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "test_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      practice_answers: {
        Row: {
          attempt_number: number | null
          consecutive_mistakes: number | null
          created_at: string | null
          difficulty_used: string | null
          hint_used: boolean | null
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string | null
          selected_answer: number | null
          session_id: string | null
          streak_at_answer: number | null
          subtopic_id: string | null
          user_id: string | null
        }
        Insert: {
          attempt_number?: number | null
          consecutive_mistakes?: number | null
          created_at?: string | null
          difficulty_used?: string | null
          hint_used?: boolean | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          selected_answer?: number | null
          session_id?: string | null
          streak_at_answer?: number | null
          subtopic_id?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_number?: number | null
          consecutive_mistakes?: number | null
          created_at?: string | null
          difficulty_used?: string | null
          hint_used?: boolean | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          selected_answer?: number | null
          session_id?: string | null
          streak_at_answer?: number | null
          subtopic_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_answers_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_streak: number | null
          id: string
          questions_answered: number | null
          session_points: Json | null
          status: Database["public"]["Enums"]["practice_status"] | null
          subject: string | null
          subtopic_attempts: Json | null
          total_points: number | null
          total_questions: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          questions_answered?: number | null
          session_points?: Json | null
          status?: Database["public"]["Enums"]["practice_status"] | null
          subject?: string | null
          subtopic_attempts?: Json | null
          total_points?: number | null
          total_questions: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          questions_answered?: number | null
          session_points?: Json | null
          status?: Database["public"]["Enums"]["practice_status"] | null
          subject?: string | null
          subtopic_attempts?: Json | null
          total_points?: number | null
          total_questions?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_media: {
        Row: {
          created_at: string | null
          id: string
          media_type: string
          media_url: string
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_type: string
          media_url: string
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_permissions: {
        Row: {
          course_text: string | null
          created_at: string | null
          has_course: boolean | null
          has_practice: boolean | null
          has_simulator: boolean | null
          id: string
          practice_text: string | null
          product_id: string | null
          simulator_text: string | null
          test_type_id: string | null
        }
        Insert: {
          course_text?: string | null
          created_at?: string | null
          has_course?: boolean | null
          has_practice?: boolean | null
          has_simulator?: boolean | null
          id?: string
          practice_text?: string | null
          product_id?: string | null
          simulator_text?: string | null
          test_type_id?: string | null
        }
        Update: {
          course_text?: string | null
          created_at?: string | null
          has_course?: boolean | null
          has_practice?: boolean | null
          has_simulator?: boolean | null
          id?: string
          practice_text?: string | null
          product_id?: string | null
          simulator_text?: string | null
          test_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_permissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_permissions_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          currency: string | null
          custom_features: string[] | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          status: Database["public"]["Enums"]["product_status"] | null
          test_type_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          custom_features?: string[] | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          status?: Database["public"]["Enums"]["product_status"] | null
          test_type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          custom_features?: string[] | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          status?: Database["public"]["Enums"]["product_status"] | null
          test_type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_payment_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          choice1: string
          choice2: string
          choice3: string
          choice4: string
          comparison_value1: string | null
          comparison_value2: string | null
          correct_answer: number
          created_at: string
          difficulty: Database["public"]["Enums"]["question_difficulty"] | null
          explanation: string | null
          explanation_image_url: string | null
          id: string
          image_url: string | null
          passage_text: string | null
          question_text: string
          question_type: string
          subtopic_id: string | null
          test_type_id: string | null
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          choice1: string
          choice2: string
          choice3: string
          choice4: string
          comparison_value1?: string | null
          comparison_value2?: string | null
          correct_answer: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["question_difficulty"] | null
          explanation?: string | null
          explanation_image_url?: string | null
          id?: string
          image_url?: string | null
          passage_text?: string | null
          question_text: string
          question_type?: string
          subtopic_id?: string | null
          test_type_id?: string | null
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          choice1?: string
          choice2?: string
          choice3?: string
          choice4?: string
          comparison_value1?: string | null
          comparison_value2?: string | null
          correct_answer?: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["question_difficulty"] | null
          explanation?: string | null
          explanation_image_url?: string | null
          id?: string
          image_url?: string | null
          passage_text?: string | null
          question_text?: string
          question_type?: string
          subtopic_id?: string | null
          test_type_id?: string | null
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          test_type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          test_type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          test_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      subtopics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      test_modules: {
        Row: {
          created_at: string
          description: string | null
          difficulty_levels: string[] | null
          id: string
          name: string
          order_index: number | null
          subject_id: string | null
          test_template_id: string | null
          test_type_id: string | null
          time_limit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_levels?: string[] | null
          id?: string
          name: string
          order_index?: number | null
          subject_id?: string | null
          test_template_id?: string | null
          test_type_id?: string | null
          time_limit: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_levels?: string[] | null
          id?: string
          name?: string
          order_index?: number | null
          subject_id?: string | null
          test_template_id?: string | null
          test_type_id?: string | null
          time_limit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_modules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_modules_test_template_id_fkey"
            columns: ["test_template_id"]
            isOneToOne: false
            referencedRelation: "test_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_modules_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          quantitative_score: number | null
          started_at: string | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
          verbal_score: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quantitative_score?: number | null
          started_at?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verbal_score?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quantitative_score?: number | null
          started_at?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verbal_score?: number | null
        }
        Relationships: []
      }
      test_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          total_time: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          total_time: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          total_time?: number
          updated_at?: string
        }
        Relationships: []
      }
      test_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          subject_id: string | null
          test_type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject_id?: string | null
          test_type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject_id?: string | null
          test_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          created_at: string | null
          earned_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "overall_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "weekly_leaderboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_product_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          product_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          product_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_product_access_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string | null
          id: string
          last_activity: string | null
          points: number
          questions_attempted: number | null
          questions_correct: number | null
          topic_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_activity?: string | null
          points?: number
          questions_attempted?: number | null
          questions_correct?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_activity?: string | null
          points?: number
          questions_attempted?: number | null
          questions_correct?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subtopic_progress: {
        Row: {
          created_at: string | null
          id: string
          last_practiced: string | null
          points: number
          subtopic_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          points?: number
          subtopic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          points?: number
          subtopic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subtopic_progress_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subtopic_statistics: {
        Row: {
          accuracy: number | null
          correct_answers: number | null
          created_at: string | null
          id: string
          last_practiced: string | null
          questions_answered: number | null
          subtopic_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          questions_answered?: number | null
          subtopic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          questions_answered?: number | null
          subtopic_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subtopic_statistics_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_points: {
        Row: {
          date_recorded: string | null
          id: string
          points: number
          user_id: string | null
        }
        Insert: {
          date_recorded?: string | null
          id?: string
          points?: number
          user_id?: string | null
        }
        Update: {
          date_recorded?: string | null
          id?: string
          points?: number
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      module_total_questions: {
        Row: {
          module_id: string | null
          total_questions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "test_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      overall_leaderboard: {
        Row: {
          avatar_url: string | null
          rank: number | null
          total_points: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      weekly_leaderboard: {
        Row: {
          avatar_url: string | null
          rank: number | null
          user_id: string | null
          username: string | null
          weekly_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_progress_decay: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_session_points: {
        Args: {
          session_id: string
        }
        Returns: number
      }
      check_feature_access: {
        Args: {
          user_id: string
          feature_name: string
        }
        Returns: boolean
      }
      check_platform_access: {
        Args: {
          user_id_input: string
          platform: Database["public"]["Enums"]["platform_type"]
        }
        Returns: boolean
      }
      check_test_type_access: {
        Args: {
          user_id: string
          test_type_id: string
        }
        Returns: boolean
      }
      delete_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_concurrent_sessions: {
        Args: {
          user_id_input: string
        }
        Returns: number
      }
      get_module_total_questions: {
        Args: {
          module_id: string
        }
        Returns: number
      }
      get_random_unanswered_question: {
        Args: {
          p_difficulty: string
          p_topic_ids: string[]
          p_answered_ids: string[]
        }
        Returns: {
          choice1: string
          choice2: string
          choice3: string
          choice4: string
          comparison_value1: string | null
          comparison_value2: string | null
          correct_answer: number
          created_at: string
          difficulty: Database["public"]["Enums"]["question_difficulty"] | null
          explanation: string | null
          explanation_image_url: string | null
          id: string
          image_url: string | null
          passage_text: string | null
          question_text: string
          question_type: string
          subtopic_id: string | null
          test_type_id: string | null
          topic_id: string | null
          updated_at: string
        }[]
      }
      get_user_total_points: {
        Args: {
          user_id_input: string
        }
        Returns: number
      }
      get_user_weekly_points: {
        Args: {
          user_id_input: string
        }
        Returns: number
      }
      grant_platform_access: {
        Args: {
          user_id_input: string
          platform: Database["public"]["Enums"]["platform_type"]
        }
        Returns: undefined
      }
    }
    Enums: {
      difficulty_level: "Easy" | "Moderate" | "Hard"
      module_status: "pending" | "in_progress" | "completed"
      platform_type: "gat" | "sat" | "act"
      practice_status: "in_progress" | "completed" | "abandoned"
      product_status: "active" | "inactive"
      question_difficulty: "Easy" | "Moderate" | "Hard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
