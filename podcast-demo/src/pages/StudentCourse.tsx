import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CourseModule, Course } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

type ModuleWithProgress = CourseModule & {
  completed: boolean;
  completed_at: string | null;
  progress_id: string | null;
};

export function StudentCourse() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, [profile?.id]);

  async function loadCourseData() {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.id) return;

      // Get the course (we only have one course in our app)
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .limit(1)
        .single();

      if (courseError) {
        throw courseError;
      }

      setCourse(courses);

      // Get all modules for the course
      const { data: courseModules, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courses.id)
        .order('week_number');

      if (modulesError) {
        throw modulesError;
      }

      // Get student progress for these modules
      const { data: progress, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', profile.id);

      if (progressError) {
        throw progressError;
      }

      // Combine module data with progress
      const modulesWithProgress = courseModules.map((module: CourseModule) => {
        const moduleProgress = progress.find((p: any) => p.module_id === module.id);
        return {
          ...module,
          completed: moduleProgress ? moduleProgress.completed : false,
          completed_at: moduleProgress ? moduleProgress.completed_at : null,
          progress_id: moduleProgress ? moduleProgress.id : null,
        };
      });

      setModules(modulesWithProgress);

      // Set the active module to the first incomplete module, or the last module if all complete
      const firstIncomplete = modulesWithProgress.find((m) => !m.completed);
      if (firstIncomplete) {
        setActiveModule(firstIncomplete.id);
      } else if (modulesWithProgress.length > 0) {
        setActiveModule(modulesWithProgress[modulesWithProgress.length - 1].id);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      setError('Failed to load course data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleComplete(moduleId: string, isCompleted: boolean) {
    try {
      setError(null);
      
      const module = modules.find((m) => m.id === moduleId);
      
      if (!module) return;

      if (module.progress_id) {
        // Update existing progress
        const { error } = await supabase
          .from('student_progress')
          .update({
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', module.progress_id);

        if (error) throw error;
      } else {
        // Create new progress entry
        const { error } = await supabase
          .from('student_progress')
          .insert([
            {
              student_id: profile?.id,
              module_id: moduleId,
              completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
            },
          ]);

        if (error) throw error;
      }

      // Update local state
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
              }
            : m
        )
      );
    } catch (error) {
      console.error('Error updating module completion:', error);
      setError('Failed to update module progress. Please try again.');
    }
  }

  function handleGoToLesson(weekNumber: number) {
    navigate(`/course/lesson${weekNumber}`);
  }

  if (loading) {
    return <div className="loading-container">Loading course content...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const activeModuleData = modules.find((m) => m.id === activeModule);

  return (
    <div className="course-container">
      <h1 className="course-title">{course?.title}</h1>
      <p className="course-description">{course?.description}</p>

      <div className="course-layout">
        <div className="module-sidebar">
          <h2>Course Modules</h2>
          <div className="module-list">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`module-item ${
                  module.id === activeModule ? 'active' : ''
                } ${module.completed ? 'completed' : ''}`}
                onClick={() => setActiveModule(module.id)}
              >
                <div className="module-week">Week {module.week_number}</div>
                <div className="module-title">{module.title}</div>
                {module.completed && <div className="module-check">✓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="module-content">
          {activeModuleData ? (
            <>
              <div className="module-header">
                <h2>
                  Week {activeModuleData.week_number}: {activeModuleData.title}
                </h2>
                <div className="module-status">
                  Status:{' '}
                  <span
                    className={`status-indicator ${
                      activeModuleData.completed ? 'completed' : 'incomplete'
                    }`}
                  >
                    {activeModuleData.completed ? 'Completed' : 'Incomplete'}
                  </span>
                  {activeModuleData.completed && activeModuleData.completed_at && (
                    <span className="completed-date">
                      on{' '}
                      {new Date(activeModuleData.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="module-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleGoToLesson(activeModuleData.week_number)}
                  >
                    Go to Lesson
                  </button>
                </div>
              </div>
              <div className="module-description">{activeModuleData.content}</div>
            </>
          ) : (
            <div className="no-module-selected">
              <p>Select a module from the sidebar to view content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 