import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import DOMPurify from 'dompurify';

type LessonProps = {
  lessonNumber: number;
  title: string;
  content: string;
};

export default function Lesson({ lessonNumber, title, content }: LessonProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      navigate('/login');
      return;
    }
    
    loadModuleData();
  }, [profile?.id]);

  async function loadModuleData() {
    try {
      setLoading(true);
      setError(null);

      // Get the module for this lesson by week number
      const { data: module, error: moduleError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('week_number', lessonNumber)
        .single();

      if (moduleError) throw moduleError;
      
      setModuleId(module.id);

      // Get student progress for this module
      const { data: progress, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', profile?.id)
        .eq('module_id', module.id)
        .maybeSingle();

      if (progressError) throw progressError;
      
      if (progress) {
        setProgressId(progress.id);
        setCompleted(progress.completed);
      }
    } catch (error) {
      console.error('Error loading module data:', error);
      setError('Failed to load module data');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete() {
    try {
      setError(null);
      
      if (!moduleId || !profile?.id) return;

      if (progressId) {
        // Update existing progress
        const { error } = await supabase
          .from('student_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', progressId);

        if (error) throw error;
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('student_progress')
          .insert([
            {
              student_id: profile.id,
              module_id: moduleId,
              completed: true,
              completed_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          setProgressId(data[0].id);
        }
      }

      setCompleted(true);
      // Navigate back to course page after marking complete
      navigate('/course');
      
    } catch (error) {
      console.error('Error updating module completion:', error);
      setError('Failed to update module progress');
    }
  }

  async function handleMarkIncomplete() {
    try {
      setError(null);
      
      if (!progressId) return;

      const { error } = await supabase
        .from('student_progress')
        .update({
          completed: false,
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', progressId);

      if (error) throw error;

      setCompleted(false);
      
    } catch (error) {
      console.error('Error updating module completion:', error);
      setError('Failed to update module progress');
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <h1>Week {lessonNumber}: {title}</h1>
        <div className="completion-status">
          Status: <span className={`status ${completed ? 'completed' : 'incomplete'}`}>
            {completed ? 'Completed' : 'Incomplete'}
          </span>
        </div>
      </div>
      
      <div className="lesson-content" dangerouslySetInnerHTML={createMarkup(content)}></div>
      
      <div className="lesson-actions">
        {!completed ? (
          <button 
            className="btn-complete"
            onClick={handleMarkComplete}
          >
            Mark as Complete
          </button>
        ) : (
          <button 
            className="btn-incomplete"
            onClick={handleMarkIncomplete}
          >
            Mark as Incomplete
          </button>
        )}
        
        <button 
          className="btn-back"
          onClick={() => navigate('/course')}
        >
          Back to Course
        </button>
      </div>
    </div>
  );
} 