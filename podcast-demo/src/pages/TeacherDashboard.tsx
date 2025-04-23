import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, StudentProgress, CourseModule } from '../utils/supabase';
import { Link, useNavigate } from 'react-router-dom';

type StudentWithProgress = {
  profile: Profile;
  progress: {
    completed: number;
    total: number;
    modules: Array<{
      module_id: string;
      module_title: string;
      week_number: number;
      completed: boolean;
      completed_at: string | null;
    }>;
  };
};

export function TeacherDashboard() {
  const { profile, signOut } = useAuth();
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.id) {
        console.error("Cannot load students: Teacher profile not found");
        setError("Your profile could not be loaded");
        return;
      }

      // Get students assigned to this teacher
      const { data: studentTeachers, error: studentsError } = await supabase
        .from('student_teacher')
        .select('student_id')
        .eq('teacher_id', profile.id);

      if (studentsError) {
        console.error("Error fetching student relationships:", studentsError);
        throw studentsError;
      }

      if (!studentTeachers?.length) {
        console.log("No students found for this teacher");
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = studentTeachers.map((st) => st.student_id);
      console.log(`Found ${studentIds.length} students for this teacher`);

      // Get profiles for these students
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      if (profilesError) {
        console.error("Error fetching student profiles:", profilesError);
        throw profilesError;
      }

      console.log(`Retrieved ${studentProfiles?.length || 0} student profiles`);

      // Get all modules
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .order('week_number');

      if (modulesError) {
        console.error("Error fetching course modules:", modulesError);
        throw modulesError;
      }

      console.log(`Retrieved ${modules?.length || 0} course modules`);

      // Get progress for all students
      const { data: progresses, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .in('student_id', studentIds);

      if (progressError) {
        console.error("Error fetching student progress:", progressError);
        throw progressError;
      }

      console.log(`Retrieved ${progresses?.length || 0} progress records`);

      // Compile all data
      const studentsWithProgress = studentProfiles.map((student: Profile) => {
        const studentProgress = progresses ? progresses.filter(
          (p: StudentProgress) => p.student_id === student.id
        ) : [];

        const moduleProgress = modules.map((module: CourseModule) => {
          const progress = studentProgress.find(
            (p: StudentProgress) => p.module_id === module.id
          );

          return {
            module_id: module.id,
            module_title: module.title,
            week_number: module.week_number,
            completed: progress ? progress.completed : false,
            completed_at: progress ? progress.completed_at : null,
          };
        });

        const completed = moduleProgress.filter((m) => m.completed).length;
        const total = modules.length;

        return {
          profile: student,
          progress: {
            completed,
            total,
            modules: moduleProgress,
          },
        };
      });

      setStudents(studentsWithProgress);
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      loadStudents();
    }
  }, [profile?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="loading-container">
        <p>Loading student progress...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <button 
          className="btn-link" 
          onClick={handleSignOut}
        >
          Sign Out
        </button>
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh} 
            className="btn-secondary"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Link to="/create-student" className="btn-primary">
            Add New Student
          </Link>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {students.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any students yet.</p>
          <Link to="/students" className="btn-primary mt-4">
            Manage Students
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          {students.map((student) => (
            <div key={student.profile.id} className="student-card">
              <h3>{student.profile.full_name}</h3>
              <p className="student-email">{student.profile.email}</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(student.progress.completed / student.progress.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="progress-text">
                {student.progress.completed} of {student.progress.total} modules completed
                ({Math.round((student.progress.completed / Math.max(student.progress.total, 1)) * 100)}%)
              </p>
              <div className="module-progress">
                {student.progress.modules.map((module) => (
                  <div
                    key={module.module_id}
                    className={`module-indicator ${module.completed ? 'completed' : ''}`}
                    title={`Week ${module.week_number}: ${module.module_title} ${
                      module.completed ? '(Completed)' : '(Not completed)'
                    }`}
                  >
                    {module.week_number}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 