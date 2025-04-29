import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile } from '../utils/supabase';
import { Link } from 'react-router-dom';

type ResetResult = {
  success: boolean;
  message: string;
};

export function Students() {
  const { profile, resetPassword } = useAuth();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState<{[key: string]: boolean}>({});
  const [resetResults, setResetResults] = useState<{[key: string]: ResetResult}>({});

  useEffect(() => {
    console.log("Students component mounted, profile:", profile?.id);
    fetchStudents();
  }, [profile?.id]);

  async function fetchStudents() {
    try {
      console.log("Fetching students for teacher:", profile?.id);
      setLoading(true);
      setError(null);

      if (!profile?.id) {
        console.log("No teacher profile found, can't fetch students");
        return;
      }

      // Get students assigned to this teacher
      console.log("Querying student_teacher relationships");
      const { data: studentTeachers, error: relationError } = await supabase
        .from('student_teacher')
        .select('student_id')
        .eq('teacher_id', profile.id);

      if (relationError) {
        console.error("Error fetching student-teacher relationships:", relationError);
        throw relationError;
      }

      console.log(`Found ${studentTeachers?.length || 0} student relationships`);
      
      if (!studentTeachers?.length) {
        console.log("No students found for this teacher");
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = studentTeachers.map((st) => st.student_id);
      console.log("Student IDs:", studentIds);

      // Get profiles for these students
      console.log("Fetching student profiles");
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      if (profilesError) {
        console.error("Error fetching student profiles:", profilesError);
        throw profilesError;
      }

      console.log(`Retrieved ${studentProfiles?.length || 0} student profiles`);
      setStudents(studentProfiles || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStudent(e: FormEvent) {
    e.preventDefault();
    
    if (!studentEmail) {
      setAddError('Please enter a student email');
      return;
    }

    try {
      console.log(`Attempting to add student with email: ${studentEmail}`);
      setAddingStudent(true);
      setAddError(null);
      setSuccessMessage(null);

      if (!profile?.id) {
        console.error("Cannot add student: No teacher profile found");
        setAddError("Unable to add student: Your profile is not properly loaded");
        return;
      }

      // Find if this user exists and is a student
      console.log("Checking if student exists with email:", studentEmail);
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, role, email, full_name')
        .eq('email', studentEmail)
        .eq('role', 'student')
        .maybeSingle();

      if (userError) {
        console.error("Error finding student:", userError);
        if (userError.code === 'PGRST116') {
          setAddError('No student found with that email address');
        } else {
          throw userError;
        }
        return;
      }

      if (!existingUsers) {
        console.log("No student found with email:", studentEmail);
        setAddError('No student found with that email address');
        return;
      }

      console.log("Found student:", existingUsers);

      // Check if already assigned to this teacher
      console.log("Checking if student is already assigned to this teacher");
      const { data: existingRelation, error: relationCheckError } = await supabase
        .from('student_teacher')
        .select('*')
        .eq('teacher_id', profile.id)
        .eq('student_id', existingUsers.id)
        .maybeSingle();

      if (relationCheckError) {
        console.error("Error checking existing relationship:", relationCheckError);
        throw relationCheckError;
      }

      if (existingRelation) {
        console.log("Student already assigned to this teacher");
        setAddError('This student is already assigned to you');
        return;
      }

      // Add relationship
      console.log("Creating student-teacher relationship");
      const { data: insertData, error: addError } = await supabase
        .from('student_teacher')
        .insert([
          {
            teacher_id: profile.id,
            student_id: existingUsers.id,
          },
        ])
        .select();

      if (addError) {
        console.error("Error adding student relationship:", addError);
        throw addError;
      }

      console.log("Successfully added student relationship:", insertData);
      setSuccessMessage(`Successfully added ${existingUsers.full_name} to your students`);
      setStudentEmail('');
      await fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      setAddError('Failed to add student. Please try again.');
    } finally {
      setAddingStudent(false);
    }
  }

  async function handleRemoveStudent(studentId: string) {
    if (!confirm('Are you sure you want to completely remove this student? This will permanently delete their account and all their data.')) {
      return;
    }

    try {
      console.log(`Completely removing student with ID: ${studentId}`);
      setError(null);

      if (!profile?.id) {
        console.error("Cannot remove student: No teacher profile found");
        setError("Unable to remove student: Your profile is not properly loaded");
        return;
      }

      // Step 1: Delete student submissions
      console.log("Deleting student submissions...");
      const { error: submissionsError } = await supabase
        .from('student_submissions')
        .delete()
        .eq('student_id', studentId);

      if (submissionsError) {
        console.error("Error deleting student submissions:", submissionsError);
        throw submissionsError;
      }

      // Step 2: Delete student progress
      console.log("Deleting student progress...");
      const { error: progressError } = await supabase
        .from('student_progress')
        .delete()
        .eq('student_id', studentId);

      if (progressError) {
        console.error("Error deleting student progress:", progressError);
        throw progressError;
      }

      // Step 3: Delete student-teacher relationships
      console.log("Deleting student-teacher relationships...");
      const { error: relationshipError } = await supabase
        .from('student_teacher')
        .delete()
        .eq('student_id', studentId);

      if (relationshipError) {
        console.error("Error deleting student-teacher relationships:", relationshipError);
        throw relationshipError;
      }

      // Step 4: Delete student profile
      console.log("Deleting student profile...");
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (profileError) {
        console.error("Error deleting student profile:", profileError);
        throw profileError;
      }
      
      // Step 5: Delete the user using admin function
      console.log("Deleting auth user...");
      const { error: deleteUserError } = await supabase.rpc('admin_delete_user', {
        target_user_id: studentId
      });
      
      if (deleteUserError) {
        console.error("Error deleting auth user:", deleteUserError);
        throw deleteUserError;
      }

      console.log("Student successfully removed from the system");
      setStudents(students.filter((s) => s.id !== studentId));
    } catch (error) {
      console.error('Error removing student:', error);
      setError('Failed to completely remove student. Please contact an administrator.');
    }
  }

  async function handleResetPassword(studentId: string, email: string) {
    try {
      // Mark this student as being processed
      setResetLoading(prev => ({ ...prev, [studentId]: true }));
      
      // Clear any previous results for this student
      setResetResults(prev => {
        const newResults = { ...prev };
        delete newResults[studentId];
        return newResults;
      });
      
      console.log(`Sending password reset email to student: ${email}`);
      
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error("Error sending password reset:", error);
        setResetResults(prev => ({ 
          ...prev, 
          [studentId]: { 
            success: false, 
            message: error.message || 'Failed to send password reset email'
          }
        }));
        return;
      }
      
      console.log("Password reset email sent successfully");
      setResetResults(prev => ({ 
        ...prev, 
        [studentId]: { 
          success: true, 
          message: 'Password reset email sent successfully'
        }
      }));
      
      // Clear the result after 5 seconds
      setTimeout(() => {
        setResetResults(prev => {
          const newResults = { ...prev };
          delete newResults[studentId];
          return newResults;
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetResults(prev => ({ 
        ...prev, 
        [studentId]: { 
          success: false, 
          message: 'An unexpected error occurred'
        }
      }));
    } finally {
      setResetLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[studentId];
        return newLoading;
      });
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="students-container">
      <h2>Manage Students</h2>
      
      <div className="create-student-section">
        <h3>Student Management</h3>
        <p>
          Create a new student account or add an existing student to your class.
        </p>
        <div className="button-group">
          <Link to="/create-student" className="btn-primary">
            Create New Student Account
          </Link>
          <p className="mt-2 text-sm">Or add an existing student below:</p>
        </div>
      </div>
      
      <div className="add-student-section">
        <h3>Add Existing Student</h3>
        {addError && <div className="error-message">{addError}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <form onSubmit={handleAddStudent}>
          <div className="form-group">
            <label htmlFor="studentEmail">Student Email</label>
            <input
              type="email"
              id="studentEmail"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="Enter student's email address"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={addingStudent}>
            {addingStudent ? 'Adding...' : 'Add Existing Student'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="student-table">
        <h3>Your Students</h3>
        {students.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any students yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.full_name}</td>
                  <td>{student.email}</td>
                  <td>
                    <div className="student-actions">
                      <button
                        className="btn-password-reset"
                        onClick={() => handleResetPassword(student.id, student.email)}
                        disabled={resetLoading[student.id]}
                        title="Send password reset email"
                      >
                        {resetLoading[student.id] ? 'Sending...' : 'Reset Password'}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleRemoveStudent(student.id)}
                        title="Permanently delete this student and all their data"
                      >
                        🗑️<span className="btn-danger-text">Delete Student</span>
                      </button>
                      {resetResults[student.id] && (
                        <span className={`reset-result ${resetResults[student.id].success ? 'success' : 'error'}`}>
                          {resetResults[student.id].message}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 