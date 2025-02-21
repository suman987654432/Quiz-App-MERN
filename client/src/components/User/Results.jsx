import { useLocation, useNavigate } from 'react-router-dom';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Navigate to home/login page
    navigate('/');
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Quiz completed</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Quiz Completed!</h1>
        <p className="text-xl mb-6">
          Score: {result.score} out of {result.total}
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Results; 