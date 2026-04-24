import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const { text, setText, isListening, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${id}`);
        setInterview(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInterview();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!text.trim()) return;
    
    setIsEvaluating(true);
    const questionId = interview.questions[currentQIndex]._id;
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews/evaluate`, {
        interviewId: id,
        questionId,
        answer: text
      });
      
      setIsEvaluating(false);
      setText('');
      
      if (currentQIndex < interview.questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        navigate(`/results/${id}`);
      }
    } catch (err) {
      console.error(err);
      setIsEvaluating(false);
    }
  };

  if (!interview) return <Loader text="Loading room..." />;
  
  const currentQ = interview.questions[currentQIndex];

  return (
    <div className="interview-room">
      <div className="progress-bar">
        Questions {currentQIndex + 1} / {interview.questions.length}
      </div>

      <GlassCard className="question-card glowing">
        <div className="q-badge">Question {currentQIndex + 1}</div>
        <h2 className="question-text">{currentQ?.question}</h2>
      </GlassCard>

      <GlassCard className="answer-section">
        <h3 className="section-title">Your Answer</h3>
        
        {!isSupported && (
          <div className="warning-banner">
            Web Speech API is not supported in this browser. Please type your answer below.
          </div>
        )}

        <div className="voice-controls">
          <Button 
            variant={isListening ? 'danger' : 'primary'} 
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported || isEvaluating}
            className={`mic-btn ${isListening ? 'listening' : ''}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            {isListening ? 'Recording...' : 'Record Voice'}
          </Button>
          
          {isListening && (
            <div className="audio-visualizer">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          )}
        </div>

        <textarea
          className="answer-textarea"
          placeholder="Speak into your mic or type here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isEvaluating}
          rows={6}
        ></textarea>

        <div className="action-row">
          <Button 
            variant="primary" 
            onClick={handleSubmitAnswer} 
            isLoading={isEvaluating}
            disabled={!text.trim()}
          >
            <Send size={18} />
            {currentQIndex === interview.questions.length - 1 ? 'Finish Interview' : 'Submit & Next'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default InterviewRoom;
