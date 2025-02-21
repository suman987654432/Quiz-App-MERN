import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizInterface = () => {
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
    }, []);

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

            if (response.status === 401) {
                localStorage.removeItem('userToken');
                navigate('/');
                return;
            }

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

    // Rest of the component...
};

export default QuizInterface; 