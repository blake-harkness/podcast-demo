import Lesson from './LessonTemplate';

export default function Planning() {
  return (
    <Lesson
      lessonNumber={2}
      title="Planning Your Podcast"
      content={`
        <h2>Planning for Success</h2>
        <p>A well-planned podcast has a much better chance of success and longevity. In this lesson, we'll cover how to plan effectively.</p>
        
        <h3>Defining Your Podcast</h3>
        <ul>
          <li><strong>Concept</strong>: What is your podcast about? Be specific.</li>
          <li><strong>Target Audience</strong>: Who are you creating content for?</li>
          <li><strong>Unique Value</strong>: What makes your podcast different?</li>
          <li><strong>Format</strong>: Solo, interview, panel, documentary, fiction, etc.</li>
          <li><strong>Episode Length</strong>: 15 minutes? 30 minutes? 1 hour?</li>
        </ul>
        
        <h3>Content Planning</h3>
        <ul>
          <li><strong>Episode Structure</strong>: Introduction, segments, conclusion</li>
          <li><strong>Topic List</strong>: Create a list of potential topics for at least 10 episodes</li>
          <li><strong>Publishing Schedule</strong>: Weekly? Bi-weekly? Monthly?</li>
          <li><strong>Season Format</strong>: Will you release in seasons or continuously?</li>
        </ul>
        
        <h3>Creating a Content Calendar</h3>
        <p>A content calendar helps you plan ahead and stay consistent. Include:</p>
        <ul>
          <li>Episode topics</li>
          <li>Release dates</li>
          <li>Guest information (if applicable)</li>
          <li>Research deadlines</li>
          <li>Recording dates</li>
          <li>Editing deadlines</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Define your podcast concept, target audience, and format</li>
          <li>Create a list of 10 potential episode topics</li>
          <li>Draft a structure for your typical episode</li>
        </ol>
      `}
    />
  );
} 