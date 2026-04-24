import React from 'react';
import './ResultsChart.css';

const ResultsChart = ({ feedback }) => {
  const { relevanceScore = 0, confidenceScore = 0, clarityScore = 0 } = feedback;

  return (
    <div className="results-chart">
      <h4 className="chart-title">AI Evaluation</h4>
      
      <div className="chart-bars">
        <div className="bar-group">
          <div className="bar-label">
            <span>Relevance</span>
            <span>{relevanceScore}%</span>
          </div>
          <div className="bar-track">
            <div 
              className="bar-fill highlight-success" 
              style={{ width: `${relevanceScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bar-group">
          <div className="bar-label">
            <span>Confidence</span>
            <span>{confidenceScore}%</span>
          </div>
          <div className="bar-track">
            <div 
              className="bar-fill highlight-accent" 
              style={{ width: `${confidenceScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bar-group">
          <div className="bar-label">
            <span>Clarity</span>
            <span>{clarityScore}%</span>
          </div>
          <div className="bar-track">
            <div 
              className="bar-fill highlight-primary" 
              style={{ width: `${clarityScore}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;
