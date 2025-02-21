import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Results = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.answers) {
      navigate('/quiz');
      return;
    }
    submitAnswers();
  }, []);

  const submitAnswers = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: Object.values(location.state.answers)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error submitting answers:', error);
      setError('Failed to submit answers');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/quiz')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Quiz Submission</h2>

          {/* Question Circles */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-2 font-medium transition-all duration-200
                  ${result.userAnswer ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-gray-50 text-gray-500'}
                  hover:scale-110
                `}
                title={`Question ${index + 1} ${result.userAnswer ? '- Attempted' : '- Not attempted'}`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Thank You Message */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Thank you for completing the quiz!
            </p>
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results; 