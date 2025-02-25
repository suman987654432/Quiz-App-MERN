import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const StartPage = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    if (!userName || !userEmail) {
      navigate('/');
    }
  }, [navigate]);

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome {localStorage.getItem('userName')}!</h2>
        <p className="mb-6 text-gray-600">Click the button below to start your quiz</p>
        <button
          onClick={handleStartQuiz}
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default StartPage;
