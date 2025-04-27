import Lesson from './LessonTemplate';

export default function Lesson5() {
  return (
    <Lesson
      lessonNumber={5}
      title="Recording Setup & Pre-Interview Preparation"
      content={`
        <h2>Preparing for a Successful Interview</h2>
        <p>This lesson covers technical setup and pre-interview preparation to ensure professional podcast interviews.</p>
        
        <h3>Recording Environment Setup</h3>
        <ul>
          <li><strong>Room Selection</strong>: Finding and creating a quiet recording space</li>
          <li><strong>Acoustic Treatment</strong>: Simple solutions for echo reduction</li>
          <li><strong>Equipment Positioning</strong>: Optimal placement of microphones and accessories</li>
          <li><strong>Test Recording</strong>: Checking audio quality before the interview</li>
        </ul>
        
        <h3>Remote Interview Setup</h3>
        <ul>
          <li><strong>Software Selection</strong>: Comparing Zoom, Squadcast, Zencastr, etc.</li>
          <li><strong>Connection Stability</strong>: Ensuring reliable internet</li>
          <li><strong>Remote Guest Preparation</strong>: Creating a checklist for your interviewee</li>
          <li><strong>Recording Backup Solutions</strong>: Setting up redundancy to prevent lost content</li>
        </ul>
        
        <h3>Pre-Interview Protocol</h3>
        <ul>
          <li><strong>Guest Communication</strong>: Discussing expectations and technical requirements</li>
          <li><strong>Question Preparation</strong>: Crafting thoughtful questions that flow naturally</li>
          <li><strong>Research Review</strong>: Last-minute checks of guest information</li>
          <li><strong>Mental Preparation</strong>: Techniques for interview focus and presence</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Set up and test your recording environment</li>
          <li>Prepare a comprehensive pre-interview checklist</li>
          <li>Create a detailed question document for your intended guest</li>
          <li>Schedule your interview with at least one week's notice</li>
        </ol>
        
        <p><em>Note: This is placeholder content based on the lesson title. For complete lesson materials, please refer to the provided PDF.</em></p>
      `}
    />
  );
} 