import Lesson from './LessonTemplate';

export default function Editing() {
  return (
    <Lesson
      lessonNumber={4}
      title="Editing Your Podcast"
      content={`
        <h2>Podcast Editing Techniques</h2>
        <p>Professional editing can take your podcast from good to great. This lesson covers essential editing skills.</p>
        
        <h3>Editing Software Options</h3>
        <ul>
          <li><strong>Free Options</strong>: Audacity, GarageBand (Mac only)</li>
          <li><strong>Paid Options</strong>: Adobe Audition, Logic Pro X (Mac), Hindenburg</li>
          <li><strong>DAWs</strong>: Digital Audio Workstations like Reaper or Pro Tools</li>
        </ul>
        
        <h3>Basic Editing Tasks</h3>
        <ul>
          <li><strong>Trim</strong>: Remove unwanted sections at the beginning and end</li>
          <li><strong>Cut</strong>: Remove mistakes, long pauses, or tangents</li>
          <li><strong>Level</strong>: Ensure consistent volume throughout the episode</li>
          <li><strong>Noise Reduction</strong>: Remove background noise and hums</li>
          <li><strong>EQ</strong>: Enhance voice frequencies for clarity</li>
          <li><strong>Compression</strong>: Even out volume differences</li>
        </ul>
        
        <h3>Structuring Your Episode</h3>
        <ul>
          <li><strong>Intro</strong>: Consistent intro (with music) to establish your brand</li>
          <li><strong>Main Content</strong>: Well-organized segments</li>
          <li><strong>Transitions</strong>: Smooth movement between topics</li>
          <li><strong>Outro</strong>: Call to action and preview of next episode</li>
        </ul>
        
        <h3>Music and Sound Effects</h3>
        <ul>
          <li>Use royalty-free music or purchase licenses</li>
          <li>Maintain consistent sound design across episodes</li>
          <li>Use sound effects sparingly and purposefully</li>
          <li>Balance music volume below voice level</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Download and install an editing software of your choice</li>
          <li>Practice basic editing on your 3-minute recording from the previous lesson</li>
          <li>Find royalty-free intro/outro music for your podcast</li>
        </ol>
      `}
    />
  );
} 