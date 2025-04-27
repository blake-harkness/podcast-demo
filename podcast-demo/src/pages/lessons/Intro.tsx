import Lesson from './LessonTemplate';

export default function Intro() {
  return (
    <Lesson
      lessonNumber={1}
      title="Introduction to Podcasting"
      content={`
        <h2>Welcome to Podcasting!</h2>
        <p>In this first lesson, we'll cover the basics of podcasting and help you understand what you need to get started.</p>
        
        <h3>What is a Podcast?</h3>
        <p>A podcast is an audio program, similar to a radio show, that is made available in digital format for download or streaming. 
        Unlike traditional radio, podcasts allow listeners to tune in whenever they want.</p>
        
        <h3>Essential Equipment</h3>
        <ul>
          <li><strong>Microphone</strong>: The most important piece of equipment for clear, professional sound.</li>
          <li><strong>Headphones</strong>: To monitor your audio while recording.</li>
          <li><strong>Computer</strong>: For recording, editing, and uploading your podcast.</li>
          <li><strong>Recording Software</strong>: Such as Audacity (free), GarageBand (Mac), or Adobe Audition.</li>
        </ul>
        
        <h3>Types of Podcasts</h3>
        <ul>
          <li><strong>Interview</strong>: Featuring conversations with guests.</li>
          <li><strong>Solo</strong>: Just you sharing your expertise or stories.</li>
          <li><strong>Panel</strong>: Multiple hosts discussing topics.</li>
          <li><strong>Documentary</strong>: Narrative-driven storytelling.</li>
          <li><strong>Fiction</strong>: Scripted stories and drama.</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Listen to 3 different podcasts in your interest area</li>
          <li>Note what you like and dislike about each</li>
          <li>Begin thinking about your own podcast concept</li>
        </ol>
      `}
    />
  );
} 