import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Award, Zap, Target, Home } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import ResultsChart from '../components/ResultsChart';
import './Results.css';

const Results = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${id}`);
        setInterview(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, [id]);

  if (!interview) return <Loader text="Calculating your scores..." />;

  const overallScore = Math.round(interview.overallScore || 0);

  return (
    <div className="results-page">
      <div className="results-header text-center">
        <h1 className="text-gradient">Interview Complete!</h1>
        <p className="subtitle">Here is your AI-generated performance report.</p>
      </div>

      <div className="score-overview">
        <GlassCard className="score-card main-score">
          <Award size={48} className="score-icon primary" />
          <div className="score-value">{overallScore}%</div>
          <div className="score-label">Overall Score</div>
        </GlassCard>
        
        <GlassCard className="score-card detail-score">
          <Zap size={32} className="score-icon accent" />
          <div className="score-value">
            {Math.round(interview.questions.reduce((acc, q) => acc + (q.feedback?.confidenceScore || 0), 0) / interview.questions.length)}%
          </div>
          <div className="score-label">Avg Confidence</div>
        </GlassCard>

        <GlassCard className="score-card detail-score">
          <Target size={32} className="score-icon success" />
          <div className="score-value">
            {Math.round(interview.questions.reduce((acc, q) => acc + (q.feedback?.relevanceScore || 0), 0) / interview.questions.length)}%
          </div>
          <div className="score-label">Avg Relevance</div>
        </GlassCard>
      </div>

      <h2 className="section-heading">Detailed Breakdown</h2>
      
      <div className="questions-breakdown">
        {interview.questions.map((q, index) => (
          <GlassCard key={q._id} className="q-result-card">
            <div className="q-header">
              <span className="q-num">Question {index + 1}</span>
            </div>
            <h3 className="q-text">{q.question}</h3>
            
            <div className="q-answer-box">
              <strong>Your Answer:</strong>
              <p>{q.answer || "No answer provided."}</p>
            </div>

            {q.feedback && (
              <div className="feedback-section">
                <ResultsChart feedback={q.feedback} />
                
                <div className="improvements-box">
                  <strong>How to improve:</strong>
                  <p>{q.feedback.improvements}</p>
                </div>
                
                {q.feedback.keywordsHit?.length > 0 && (
                  <div className="keywords-box">
                    <strong>Keywords Hit:</strong>
                    <div className="chips">
                      {q.feedback.keywordsHit.map((kw, i) => (
                        <span key={i} className="chip">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      <div className="text-center mt-4">
        <Link to="/">
          <Button size="lg">
            <Home size={18} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Results;
