import Lesson from './LessonTemplate';

export default function Lesson7() {
  return (
    <Lesson
      lessonNumber={7}
      title="Editing your Podcast (Part 1)"
      content={`
        <h2>Introduction to Podcast Editing</h2>
        <p>This lesson covers the fundamentals of podcast editing, focusing on the initial stages of the post-production process.</p>
        
        <h3>Getting Started with Podcast Editing</h3>
        <ul>
          <li><strong>Organizing Your Audio Files</strong>: Setting up your workflow</li>
          <li><strong>Audio Editing Software Options</strong>: Overview of available tools</li>
          <li><strong>Setting Up Your Project</strong>: Creating a proper editing environment</li>
          <li><strong>Backing Up Your Files</strong>: Protecting your work</li>
        </ul>
        
        <h3>Basic Editing Techniques</h3>
        <ul>
          <li><strong>Removing Mistakes</strong>: Cutting out errors and false starts</li>
          <li><strong>Reducing Dead Air</strong>: Tightening pauses for better pacing</li>
          <li><strong>Basic Audio Clean-up</strong>: Addressing background noise</li>
          <li><strong>Fixing Audio Levels</strong>: Creating consistent volume</li>
        </ul>
        
        <h3>Structuring Your Podcast</h3>
        <ul>
          <li><strong>Creating an Engaging Intro</strong>: Setting the tone</li>
          <li><strong>Organizing Content</strong>: Arranging segments in logical order</li>
          <li><strong>Managing Transitions</strong>: Moving smoothly between topics</li>
          <li><strong>Preparing Segments</strong>: Breaking down your edit into manageable parts</li>
        </ul>
        
        <h3>Assignment</h3>
        <p>Before our next lesson, please:</p>
        <ol>
          <li>Import your podcast recording into your chosen editing software</li>
          <li>Complete a rough edit that removes major mistakes and long pauses</li>
          <li>Organize your podcast into clear segments with basic transitions</li>
          <li>Prepare a list of questions about editing challenges you've encountered</li>
        </ol>
        
        <p><em>Note: This is placeholder content based on the lesson title. For complete lesson materials, please refer to the provided PDF.</em></p>
      `}
    />
  );
} 