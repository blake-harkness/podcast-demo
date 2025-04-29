import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, StudentProgress, CourseModule, StudentSubmission } from '../utils/supabase';
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

type StudentSubmissionWithModule = {
  submission: StudentSubmission;
  module_title: string;
  week_number: number;
}

export function TeacherDashboard() {
  const { profile, signOut } = useAuth();
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmissionWithModule[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
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
    // Clear selected student when refreshing
    setSelectedStudent(null);
    setStudentSubmissions([]);
  };

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  const handleStudentClick = async (student: Profile) => {
    try {
      setLoadingSubmissions(true);
      setSelectedStudent(student);
      
      // Fetch submissions for this student
      const { data: submissions, error: submissionsError } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('student_id', student.id)
        .order('submitted_at', { ascending: false });
      
      if (submissionsError) throw submissionsError;
      
      // Get all modules for reference
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select('id, title, week_number');
        
      if (modulesError) throw modulesError;
      
      // Match submissions with module info
      const submissionsWithModuleInfo = submissions.map((submission: StudentSubmission) => {
        const module = modules.find((m: any) => m.id === submission.module_id) || {
          title: 'Unknown Module',
          week_number: 0
        };
        
        return {
          submission,
          module_title: module.title,
          week_number: module.week_number
        };
      });
      
      // Group by week number
      submissionsWithModuleInfo.sort((a, b) => a.week_number - b.week_number);
      
      setStudentSubmissions(submissionsWithModuleInfo);
    } catch (error) {
      console.error('Error loading student submissions:', error);
      setError('Failed to load student submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setStudentSubmissions([]);
  };

  if (loading && !refreshing) {
    return (
      <div className="loading-container">
        <p>Loading student progress...</p>
      </div>
    );
  }

  // Show student submissions view when a student is selected
  if (selectedStudent) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Student Submissions</h1>
          <h2>{selectedStudent.full_name}</h2>
          <button 
            className="btn-back"
            onClick={handleBackToStudents}
          >
            ← Back to All Students
          </button>
        </div>
        
        {loadingSubmissions ? (
          <div className="loading-container">
            <p>Loading submissions...</p>
          </div>
        ) : (
          <div className="submissions-container">
            {studentSubmissions.length === 0 ? (
              <div className="empty-state">
                <p>This student hasn't submitted any answers yet.</p>
              </div>
            ) : (
              <div className="submissions-list">
                {studentSubmissions.map((item, index) => (
                  <div key={item.submission.id} className="submission-card">
                    <div className="submission-header">
                      <h3>Week {item.week_number}: {item.module_title}</h3>
                      <p className="submission-date">
                        Submitted: {new Date(item.submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="submission-content">
                      <div className="submission-question">
                        <strong>Question:</strong>
                        <p>{item.submission.question_text}</p>
                      </div>
                      <div className="submission-answer">
                        <strong>Answer:</strong>
                        <p>{item.submission.answer_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="dashboard-controls">
          <button 
            className="btn-signout" 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
          <div className="dashboard-actions">
            <button 
              onClick={handleRefresh} 
              className="btn-refresh"
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <Link to="/create-student" className="btn-add-student">
              Add New Student
            </Link>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {students.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any students yet.</p>
          <Link to="/students" className="btn-manage-students">
            Manage Students
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          {students.map((student) => (
            <div 
              key={student.profile.id} 
              className="student-card"
              onClick={() => handleStudentClick(student.profile)}
              style={{ cursor: 'pointer' }}
            >
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
              <div className="view-submissions">
                Click to view submissions
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 