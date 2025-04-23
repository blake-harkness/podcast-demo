import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile } from '../utils/supabase';
import { Link } from 'react-router-dom';

export function Students() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    if (!confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      console.log(`Removing student with ID: ${studentId}`);
      setError(null);

      if (!profile?.id) {
        console.error("Cannot remove student: No teacher profile found");
        setError("Unable to remove student: Your profile is not properly loaded");
        return;
      }

      const { error } = await supabase
        .from('student_teacher')
        .delete()
        .eq('teacher_id', profile.id)
        .eq('student_id', studentId);

      if (error) {
        console.error("Error removing student:", error);
        throw error;
      }

      console.log("Student successfully removed");
      setStudents(students.filter((s) => s.id !== studentId));
    } catch (error) {
      console.error('Error removing student:', error);
      setError('Failed to remove student. Please try again.');
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

      <div className="students-list">
        <h3>Your Students</h3>
        {error && <div className="error-message">{error}</div>}
        
        {students.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any students yet. Create or add students using the options above.</p>
          </div>
        ) : (
          <div className="student-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.full_name}</td>
                    <td>{student.email}</td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 