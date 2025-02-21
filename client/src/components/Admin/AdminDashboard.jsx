import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultDetailsModal from './ResultDetailsModal';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'results'
  const [globalTimer, setGlobalTimer] = useState(30);
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchUserResults();
    fetchQuizSettings();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found');
        navigate('/admin/login');
        return;
      }

      const response = await fetch('/api/questions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('Token validation failed');
        localStorage.removeItem('token');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message || 'Failed to fetch questions');
    }
  };

  const fetchUserResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        navigate('/admin/login');
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
      const token = localStorage.getItem('token');
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

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        navigate('/admin/login');
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
        localStorage.removeItem('token');
        navigate('/admin/login');
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
      await fetch('/api/quiz/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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

  const handleGlobalTimerUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quiz/global-timer', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ globalTimer })
      });

      if (response.ok) {
        setError('');
      } else {
        throw new Error('Failed to update global timer');
      }
    } catch (error) {
      setError('Failed to update global timer');
      console.error('Error:', error);
    }
  };

  const handleDurationUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quiz/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: quizDuration })
      });

      if (response.ok) {
        setError('');
      } else {
        throw new Error('Failed to update quiz duration');
      }
    } catch (error) {
      setError('Failed to update quiz duration');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b">
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

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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

            {/* Global Timer Setting */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Quiz Duration</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="5"
                  max="180"
                  placeholder="Enter minutes"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(parseInt(e.target.value))}
                  className="p-2 border rounded w-32"
                />
                <span className="text-gray-600">minutes</span>
                <button
                  onClick={handleDurationUpdate}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Set Quiz Duration
                </button>
              </div>
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
                        <button
                          onClick={() => handleViewDetails(result)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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