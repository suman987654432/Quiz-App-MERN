import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [globalTimer, setGlobalTimer] = useState(null);
  const [error, setError] = useState('');
  const [quizDuration, setQuizDuration] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizSettings();
    fetchQuestions();
  }, []);

  const fetchQuizSettings = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('/api/quiz/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizDuration(data.duration);
      }
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('/api/quiz/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch questions');
    }
  };

  const handleAnswer = (answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    const answersArray = Array.from(
      { length: questions.length }, 
      (_, i) => answers[i] || 0
    );
    navigate('/results', { state: { answers: answersArray } });
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Timer and Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-lg font-bold text-blue-600">
              Time Allowed: {quizDuration} minutes
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion + 1) / questions.length * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-xl mb-6">{questions[currentQuestion].question}</h2>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-3 text-left rounded transition-colors ${
                answers[currentQuestion] === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            className={`px-4 py-2 rounded ${
              currentQuestion === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          <button
            onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNextQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface; 