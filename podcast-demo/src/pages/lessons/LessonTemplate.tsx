import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, StudentSubmission } from '../../utils/supabase';
import DOMPurify from 'dompurify';
import QuestionForm from '../../components/QuestionForm';

type LessonProps = {
  lessonNumber: number;
  title: string;
  content: string;
  questions?: string[]; // Add questions array
};

type AnswerMap = {
  [question: string]: string;
};

export default function Lesson({ lessonNumber, title, content, questions = [] }: LessonProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

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

      // Load any existing submissions for this module
      if (questions.length > 0 && profile?.id) {
        const { data: existingSubmissions, error: submissionsError } = await supabase
          .from('student_submissions')
          .select('*')
          .eq('student_id', profile.id)
          .eq('module_id', module.id);

        if (submissionsError) throw submissionsError;
        
        if (existingSubmissions) {
          setSubmissions(existingSubmissions);
          
          // Initialize answers state with existing submissions
          const answerMap: AnswerMap = {};
          existingSubmissions.forEach((submission) => {
            answerMap[submission.question_text] = submission.answer_text;
          });
          setAnswers(answerMap);
        }
      }
    } catch (error) {
      console.error('Error loading module data:', error);
      setError('Failed to load module data');
    } finally {
      setLoading(false);
    }
  }

  // Handle answer changes from QuestionForm components
  const handleAnswerChange = useCallback((question: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  }, []);

  // Submit all answers to Supabase
  async function submitAnswers() {
    if (!moduleId || !profile?.id) return false;
    
    try {
      for (const question of questions) {
        const answer = answers[question] || '';
        
        if (!answer.trim()) {
          setError(`Please answer all questions before marking the lesson as complete.`);
          return false;
        }
        
        // Check if we already have a submission for this question
        const existingSubmission = submissions.find(
          sub => sub.question_text === question
        );
        
        if (existingSubmission) {
          // Update existing submission
          const { error } = await supabase
            .from('student_submissions')
            .update({
              answer_text: answer,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSubmission.id);
            
          if (error) throw error;
        } else {
          // Create new submission
          const { error } = await supabase
            .from('student_submissions')
            .insert({
              student_id: profile.id,
              module_id: moduleId,
              question_text: question,
              answer_text: answer,
              submitted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (error) throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error submitting answers:', error);
      setError('Failed to submit answers. Please try again.');
      return false;
    }
  }

  async function handleMarkComplete() {
    try {
      setError(null);
      setSubmitting(true);
      
      if (!moduleId || !profile?.id) return;

      // Check if all questions have answers
      if (questions.length > 0) {
        const unansweredQuestions = questions.filter(question => 
          !answers[question] || !answers[question].trim()
        );
        
        if (unansweredQuestions.length > 0) {
          setError(`Please answer all questions before marking the lesson as complete.`);
          setSubmitting(false);
          return;
        }
        
        // Submit all answers
        const submissionSuccess = await submitAnswers();
        if (!submissionSuccess) {
          setSubmitting(false);
          return;
        }
      }

      // Update progress
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
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkIncomplete() {
    try {
      setError(null);
      setSubmitting(true);
      
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
    } finally {
      setSubmitting(false);
    }
  }

  // Function to find existing submission for a question
  const findSubmission = (question: string) => {
    return submissions.find(sub => sub.question_text === question);
  };

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
      
      {questions.length > 0 && moduleId && profile?.id && (
        <div className="lesson-questions">
          <h2>Questions</h2>
          <p className="questions-instructions">Answer all questions below before marking the lesson as complete.</p>
          {questions.map((question, index) => (
            <div key={index} className="question-container">
              <QuestionForm
                question={question}
                initialAnswer={findSubmission(question)?.answer_text || answers[question] || ''}
                onAnswerChange={handleAnswerChange}
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="lesson-actions">
        {!completed ? (
          <button 
            className="btn-complete"
            onClick={handleMarkComplete}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Mark as Complete'}
          </button>
        ) : (
          <button 
            className="btn-incomplete"
            onClick={handleMarkIncomplete}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Mark as Incomplete'}
          </button>
        )}
        
        <button 
          className="btn-back"
          onClick={() => navigate('/course')}
          disabled={submitting}
        >
          Back to Course
        </button>
      </div>
    </div>
  );
} 