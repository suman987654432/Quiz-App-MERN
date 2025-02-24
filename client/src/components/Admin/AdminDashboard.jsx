import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultDetailsModal from './ResultDetailsModal';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'results'
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timer: 30
  });
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [quizDuration, setQuizDuration] = useState(30);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [newDuration, setNewDuration] = useState(30);
  const [settings, setSettings] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchQuestions();
    fetchUserResults();
    fetchQuizSettings();
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
          return;
        }
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch questions');
    }
  };

  const fetchUserResults = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        navigate('/admin');
        return;
      }

      const response = await fetch('/api/quiz/results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user results');
      }

      const data = await response.json();
      setUserResults(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch user results');
    }
  };

  const fetchQuizSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
          return;
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
      setQuizDuration(data.duration);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch quiz settings');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        navigate('/admin');
        return;
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: newQuestion.question,
          options: newQuestion.options,
          correctAnswer: parseInt(newQuestion.correctAnswer),
          timer: parseInt(newQuestion.timer)
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add question');
      }

      const data = await response.json();
      setQuestions([...questions, data]);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timer: 30
      });
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const toggleLiveStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/quiz/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLive: !isLive })
      });
      setIsLive(!isLive);
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q._id !== questionId));
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      setError('Failed to delete question');
      console.error('Error:', error);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingQuestion)
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestions(questions.map(q =>
          q._id === editingQuestion._id ? updatedQuestion : q
        ));
        setEditingQuestion(null);
      } else {
        throw new Error('Failed to update question');
      }
    } catch (error) {
      setError('Failed to update question');
      console.error('Error:', error);
    }
  };

  const handleUpdateDuration = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/quiz/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: newDuration })
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz duration');
      }

      setQuizDuration(newDuration);
      setShowDurationModal(false);
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update quiz duration');
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/quiz/results/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete result');
      }

      // Remove the deleted result from the state
      setUserResults(userResults.filter(result => result._id !== resultId));
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete result');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-4">
              {/* Add Duration Settings Button */}
              <button
                onClick={() => setShowDurationModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Set Quiz Duration
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  navigate('/admin');
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Quiz Duration Modal */}
          {showDurationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Set Quiz Duration</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDurationModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDuration}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display current quiz duration */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Quiz Settings</h2>
            <p>Current Duration: {quizDuration} minutes</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
              <p>Duration: {settings.duration} minutes</p>
              {/* Add more settings as needed */}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Questions</h2>
              <p>Total Questions: {questions.length}</p>
              {/* Add more question stats */}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 border-b mt-6">
            <button
              className={`px-4 py-2 mr-4 ${activeTab === 'questions' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Manage Questions
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'results' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              User Results
            </button>
          </div>

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                <button
                  onClick={toggleLiveStatus}
                  className={`px-4 py-2 rounded ${isLive ? 'bg-red-500' : 'bg-green-500'
                    } text-white`}
                >
                  {isLive ? 'Stop Quiz' : 'Start Quiz'}
                </button>
              </div>

              <form onSubmit={handleQuestionSubmit} className="mb-8">
                <div className="mb-4">
                  <label className="block mb-2">Question</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    required
                  />
                </div>

                {newQuestion.options.map((option, index) => (
                  <div key={index} className="mb-4">
                    <label className="block mb-2">Option {index + 1}</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      required
                    />
                  </div>
                ))}

                <div className="mb-4">
                  <label className="block mb-2">Correct Answer (1-4)</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full p-2 border rounded"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                    required
                  />
                </div>

                {/* <div className="mb-4">
                  <label className="block mb-2">Timer (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    className="w-full p-2 border rounded"
                    value={newQuestion.timer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, timer: parseInt(e.target.value) })}
                    required
                  />
                </div> */}

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Question
                </button>
              </form>

              {/* Questions List */}
              <div>
                <h3 className="text-xl font-bold mb-4">Questions List</h3>
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={q._id} className="bg-white p-4 rounded-lg shadow">
                      {editingQuestion?._id === q._id ? (
                        <form onSubmit={handleEditQuestion} className="space-y-4">
                          <input
                            type="text"
                            value={editingQuestion.question}
                            onChange={(e) => setEditingQuestion({
                              ...editingQuestion,
                              question: e.target.value
                            })}
                            className="w-full p-2 border rounded"
                          />
                          {editingQuestion.options.map((option, i) => (
                            <input
                              key={i}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...editingQuestion.options];
                                newOptions[i] = e.target.value;
                                setEditingQuestion({
                                  ...editingQuestion,
                                  options: newOptions
                                });
                              }}
                              className="w-full p-2 border rounded"
                            />
                          ))}
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestion(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold">Question {index + 1}: {q.question}</p>
                              <ul className="ml-4 mt-2">
                                {q.options.map((option, i) => (
                                  <li
                                    key={i}
                                    className={i === q.correctAnswer - 1 ? 'text-green-600' : ''}
                                  >
                                    {i + 1}. {option}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Quiz Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userResults.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.user.name}</div>
                          <div className="text-sm text-gray-500">{result.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.score} / {result.total}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((result.score / result.total) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(result)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteResult(result._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <ResultDetailsModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 