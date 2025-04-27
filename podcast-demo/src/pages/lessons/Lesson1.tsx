import Lesson from './LessonTemplate';

export default function Lesson1() {
  return (
    <Lesson
      lessonNumber={1}
      title="Introduction to Podcasting & Research"
      content={`
        <h2>Welcome to Podcasting</h2>
        <p>This introductory lesson will help you understand the fundamentals of podcasting and how to begin your research journey.</p>
        
        <h3>Understanding Podcasting</h3>
        <ul>
          <li><strong>What is a Podcast?</strong>: Definition and key characteristics</li>
          <li><strong>Podcasting Landscape</strong>: Current trends and statistics</li>
          <li><strong>Types of Podcasts</strong>: Interview, solo, narrative, panel formats</li>
          <li><strong>Podcast Equipment Basics</strong>: Introduction to essential tools</li>
        </ul>
        
        <h3>Research Fundamentals</h3>
        <ul>
          <li><strong>Finding Your Niche</strong>: Market research for your podcast</li>
          <li><strong>Audience Research</strong>: Identifying and understanding your target listeners</li>
          <li><strong>Competitive Analysis</strong>: Studying similar podcasts</li>
          <li><strong>Content Research</strong>: Gathering information for your episodes</li>
        </ul>
        
        <h3>Getting Started</h3>
        <ul>
          <li><strong>Setting Goals</strong>: Defining what success means for your podcast</li>
          <li><strong>Podcast Naming</strong>: Strategies for creating a memorable name</li>
          <li><strong>Basic Planning</strong>: Episode structure and frequency</li>
          <li><strong>Research Tools</strong>: Online resources to support your podcast creation</li>
        </ul>
        
        <h3>First Assignment</h3>
        <p>To get started with your podcast project, please:</p>
        <ol>
          <li>Listen to 3 podcasts in your area of interest and take notes on their format and style</li>
          <li>Research and identify your target audience demographics</li>
          <li>Brainstorm 5 potential podcast topics based on your interests and audience research</li>
          <li>Create a simple one-paragraph concept for your podcast</li>
        </ol>
        
        <p><em>Note: This is placeholder content based on the lesson title. For complete lesson materials, please refer to the provided PDF.</em></p>
      `}
    />
  );
} 