import Lesson from './LessonTemplate';

export default function Lesson1() {
  const lessonContent = `
    <h2>Introduction to Podcasting</h2>
    <p>Welcome to your first week of podcasting! In this module, we'll cover the basics of what makes a great podcast and why podcasting has become such a popular medium.</p>
    <h3>What is a Podcast?</h3>
    <p>A podcast is an audio program, similar to a radio show, that is made available in digital format for download or streaming over the Internet. Podcasts are typically released as a series of episodes that listeners can subscribe to.</p>
    <h3>Why Podcast?</h3>
    <ul>
      <li><strong>Accessibility:</strong> Anyone with a smartphone or computer can create and distribute a podcast.</li>
      <li><strong>Flexibility:</strong> Listeners can enjoy podcasts while commuting, exercising, or doing household chores.</li>
      <li><strong>Connection:</strong> Podcasts create an intimate connection between the host and the audience.</li>
      <li><strong>Niche Topics:</strong> Podcasts can target specific interests and communities.</li>
    </ul>
    <h3>Elements of a Great Podcast</h3>
    <ol>
      <li><strong>Engaging Content:</strong> Interesting topics and discussions that keep listeners coming back.</li>
      <li><strong>Quality Audio:</strong> Clear sound that is easy to listen to.</li>
      <li><strong>Consistent Format:</strong> A structure that listeners can anticipate and enjoy.</li>
      <li><strong>Authentic Voice:</strong> The unique perspective and style of the host(s).</li>
      <li><strong>Thoughtful Editing:</strong> Removing mistakes and keeping the show flowing smoothly.</li>
    </ol>
    <p>Throughout this course, we'll be exploring each of these elements in depth and helping you develop the skills to create your own engaging podcast.</p>
  `;

  const questions = [
    "Why do you want to start a podcast? What topics are you interested in exploring?",
    "What are your three favorite podcasts and what do you like about them?",
    "After reading about the key elements of a great podcast, which one do you think will be most challenging for you and why?"
  ];

  return (
    <Lesson
      lessonNumber={1}
      title="Introduction to Podcasting"
      content={lessonContent}
      questions={questions}
    />
  );
} 