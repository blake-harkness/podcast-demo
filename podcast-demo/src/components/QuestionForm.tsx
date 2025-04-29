import { useState, useEffect } from 'react';

type QuestionFormProps = {
  question: string;
  initialAnswer?: string;
  onAnswerChange: (question: string, answer: string) => void;
};

export default function QuestionForm({ 
  question, 
  initialAnswer = '',
  onAnswerChange
}: QuestionFormProps) {
  const [answer, setAnswer] = useState(initialAnswer);

  // Update parent component when answer changes
  useEffect(() => {
    onAnswerChange(question, answer);
  }, [answer, question, onAnswerChange]);

  return (
    <div className="question-form">
      <h3>{question}</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        className="question-textarea"
      />
    </div>
  );
} 