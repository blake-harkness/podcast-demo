import Lesson from './LessonTemplate';

export default function Recording() {
  return (
    <Lesson
      lessonNumber={3}
      title="Recording Techniques"
      content={`
        <h2>Professional Recording Techniques</h2>
        <p>The quality of your recording is crucial for a professional podcast. This lesson covers how to achieve the best possible audio.</p>
        
        <h3>Setting Up Your Recording Space</h3>
        <ul>
          <li><strong>Quiet Environment</strong>: Choose a room with minimal external noise</li>
          <li><strong>Sound Treatment</strong>: Use blankets, curtains, or acoustic panels to reduce echo</li>
          <li><strong>Position</strong>: Stay consistent distance from your microphone</li>
          <li><strong>Pop Filter</strong>: Use a pop filter to reduce plosives (p, b, t sounds)</li>
        </ul>
        
        <h3>Microphone Techniques</h3>
        <ul>
          <li><strong>Distance</strong>: 4-6 inches from the microphone is typical</li>
          <li><strong>Angle</strong>: Speak across the microphone, not directly into it</li>
          <li><strong>Level Check</strong>: Always do a test recording to check levels</li>
          <li><strong>Handling Noise</strong>: Use a shock mount or desktop stand to reduce vibrations</li>
        </ul>
        
        <h3>Remote Interviews</h3>
        <ul>
          <li><strong>Software Options</strong>: Zencastr, Squadcast, Riverside.fm</li>
          <li><strong>Connection</strong>: Use a wired internet connection if possible</li>
          <li><strong>Headphones</strong>: Both host and guest should wear headphones</li>
          <li><strong>Local Recording</strong>: Have guests record their own audio as backup</li>
        </ul>
        
        <h3>Recording Tips</h3>
        <ul>
          <li>Hydrate before recording, not during (to avoid mouth sounds)</li>
          <li>Turn off notifications and silence phones</li>
          <li>Record 10 seconds of room tone (silence) for editing purposes</li>
          <li>Always record more than you need - you can edit down later</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Set up your recording space following these guidelines</li>
          <li>Practice recording a 3-minute introduction to your podcast</li>
          <li>Listen back and identify areas for improvement</li>
        </ol>
      `}
    />
  );
} 