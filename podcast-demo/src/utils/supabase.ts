import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbeiqqxucrdncrkvruvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZWlxcXh1Y3JkbmNya3ZydXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzOTgzODEsImV4cCI6MjA2MDk3NDM4MX0.VG2upt317lCQ1-GhJajxl2orYrpvL4SL6p2hKzQdIVg';

// Create a storage option that safely checks for localStorage availability
const getStorageOption = () => {
  try {
    // Check if window and localStorage are available (browser environment)
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage
      };
    } else {
      // In non-browser environments (like during SSR), use memory storage
      return {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: undefined // Supabase will fall back to memory storage
      };
    }
  } catch (error) {
    console.error('Storage access error:', error);
    // Fallback to memory storage if localStorage access fails
    return {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: undefined
    };
  }
};

// Create Supabase client with safe storage options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: getStorageOption()
});

export type Profile = {
  id: string;
  role: 'teacher' | 'student';
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  weeks: number;
  created_at: string;
  updated_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  week_number: number;
  page_url: string;
  created_at: string;
  updated_at: string;
};

export type StudentTeacher = {
  id: string;
  student_id: string;
  teacher_id: string;
  created_at: string;
};

export type StudentProgress = {
  id: string;
  student_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentSubmission = {
  id: string;
  student_id: string;
  module_id: string;
  question_text: string;
  answer_text: string;
  submitted_at: string;
  updated_at: string;
}; 