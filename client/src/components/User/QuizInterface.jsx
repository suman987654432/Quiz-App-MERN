import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      navigate('/');
      return;
    }
    fetchQuestions();
  }, [navigate]);

  useEffect(() => {
    const fetchQuizDuration = async () => {
      try {
        const response = await fetch('/api/quiz/duration');
        if (response.ok) {
          const data = await response.json();
          setTimeLeft(data.duration * 60); // Convert minutes to seconds
        } else {
          throw new Error('Failed to fetch quiz duration');
        }
      } catch (error) {
        console.error('Error fetching quiz duration:', error);
        setTimeLeft(30 * 60); // Default to 30 minutes if fetch fails
      }
    };

    fetchQuizDuration();
  }, []);

  // Timer effect - only start when timeLeft is set and questions are loaded
  useEffect(() => {
    if (timeLeft === null || questions.length === 0) return; // Don't start timer until everything is ready

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions]); // Add questions as dependency

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/quiz/active');

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('No questions available');
      }
      setQuestions(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch questions: ' + err.message);
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

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Check if all questions are answered
      const unansweredQuestions = questions.length - Object.keys(answers).length;
      if (unansweredQuestions > 0) {
        setError(`Please answer all questions. ${unansweredQuestions} remaining.`);
        return;
      }

      // Convert answers object to array
      const answersArray = Array.from(
        { length: questions.length },
        (_, i) => answers[i] || 0
      );

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answersArray,
          userName: localStorage.getItem('userName'),
          userEmail: localStorage.getItem('userEmail')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit quiz');
      }

      navigate('/results', { state: { result: data } });
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit quiz: ' + err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Start
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0 || timeLeft === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-xl font-bold text-red-600">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-xl mb-6">{questions[currentQuestion].question}</h2>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-3 text-left rounded transition-colors ${answers[currentQuestion] === index
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
            onClick={handlePreviousQuestion}
            className={`px-4 py-2 rounded ${currentQuestion === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface; 