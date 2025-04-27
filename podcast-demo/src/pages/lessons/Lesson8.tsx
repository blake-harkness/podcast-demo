import Lesson from './LessonTemplate';

export default function Lesson8() {
  return (
    <Lesson
      lessonNumber={8}
      title="Editing your Podcast (Part 2)"
      content={`
        <h2>Advanced Podcast Editing</h2>
        <p>This lesson builds on our previous editing session, focusing on advanced techniques to enhance your podcast's audio quality and storytelling.</p>
        
        <h3>Advanced Audio Processing</h3>
        <ul>
          <li><strong>Equalization (EQ)</strong>: Adjusting frequencies for clearer sound</li>
          <li><strong>Compression</strong>: Creating consistent volume levels</li>
          <li><strong>Noise Reduction</strong>: Advanced techniques for cleaner audio</li>
          <li><strong>De-essing</strong>: Reducing harsh sibilance sounds</li>
        </ul>
        
        <h3>Adding Production Elements</h3>
        <ul>
          <li><strong>Music Integration</strong>: Adding intro, outro, and background music</li>
          <li><strong>Sound Effects</strong>: Using SFX to enhance storytelling</li>
          <li><strong>Voice Processing</strong>: Making voices sound their best</li>
          <li><strong>Mixing Multiple Tracks</strong>: Balancing levels between hosts, guests, and elements</li>
        </ul>
        
        <h3>Finalizing Your Podcast</h3>
        <ul>
          <li><strong>Final Review Process</strong>: Methodical checking of your edit</li>
          <li><strong>Output Settings</strong>: Proper file formats and quality settings</li>
          <li><strong>ID3 Tags</strong>: Adding metadata to your audio files</li>
          <li><strong>Quality Assurance</strong>: Final testing across different devices</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Apply advanced processing to your podcast audio</li>
          <li>Add intro/outro music and any necessary sound effects</li>
          <li>Complete a final mix of your podcast episode</li>
          <li>Export your podcast in the appropriate format for publishing</li>
        </ol>
        
        <p><em>Note: This is placeholder content based on the lesson title. For complete lesson materials, please refer to the provided PDF.</em></p>
      `}
    />
  );
} 