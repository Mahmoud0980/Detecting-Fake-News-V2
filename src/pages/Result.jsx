import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

const Result = () => {
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return <Navigate to="/" />;
  }

  const getStatusClass = (status) => {
    if (status === 'trusted') return 'status-trusted';
    if (status === 'uncertain') return 'status-uncertain';
    if (status === 'fake') return 'status-fake';
    return 'status-invalid';
  };

  return (
    <div className="container">
      <div className="result-container">
        <h2>نتيجة التحليل</h2>
        
        <div className={`status-badge ${getStatusClass(result.status)}`}>
          {result.status_ar}
        </div>

        <div className="confidence-circle">
          {result.confidence}%
        </div>
        <p>مستوى الثقة في الخبر</p>

        <div className="reasons-list">
          <h3>الأسباب والتفاصيل:</h3>
          <ul>
            {result.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
            {result.matched_keywords.length === 0 && !result.is_trusted_source && (
              <li>لم يتم العثور على كلمات مشبوهة أو مصادر معروفة، النتيجة معتدلة.</li>
            )}
          </ul>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            تحليل خبر آخر
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Result;
