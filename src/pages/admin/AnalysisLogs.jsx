import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../Admin.css';

const AnalysisLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=get_logs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLogs([]);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    const labels = {
      'trusted': 'موثوق',
      'fake': 'كاذب',
      'uncertain': 'غير مؤكد',
      'invalid': 'غير صالح'
    };
    return (
      <span className={`status-badge ${status}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getConfidenceInfo = (score) => {
      let type = 'low';
      if(score > 70) type = 'high';
      else if(score > 40) type = 'med';
      return type;
  };

  return (
    <div>
      {/* Header Info */}
      <div className="log-stats">
        <div className="log-stat-card primary" style={{ gridColumn: 'span 2' }}>
            <h4><Activity size={24} /> تحليل النشاط</h4>
            <p>يتم جمع كافة البيانات المدخلة من قبل المستخدمين هنا للتحقق من دقة الخوارزمية وتحديثها.</p>
            <div className="log-stat-tags">
                <span className="log-stat-tag">فحص تلقائي</span>
                <span className="log-stat-tag">سجلات فورية</span>
            </div>
        </div>
        
        <div className="log-stat-card">
            <p className="log-stat-label">عمليات اليوم</p>
            <p className="log-stat-value">+{logs.length}</p>
        </div>

        <div className="log-stat-card">
            <p className="log-stat-label">دقة الفرز</p>
            <p className="log-stat-value indigo">98%</p>
        </div>
      </div>

      <div className="glass-card table-container" style={{ padding: 0 }}>
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 className="table-title">سجل الكشوفات</h3>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--admin-text-light)' }}>محدث منذ ثواني</span>
            </div>
            
            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="البحث في السجلات..." />
            </div>
        </div>
        
        <div className="table-wrapper">
            <table className="premium-table">
            <thead>
                <tr>
                <th width="120">التوقيت</th>
                <th>محتوى الخبر</th>
                <th>المصدر</th>
                <th style={{ textAlign: 'center' }}>تصنيف الذكاء</th>
                <th style={{ textAlign: 'center' }}>الثقة</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>جاري تحميل السجلات...</td></tr>
                ) : logs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>لا توجد بيانات مسجلة</td></tr>
                ) : logs.map((log) => {
                    const cType = getConfidenceInfo(log.confidence_score);
                    const dt = new Date(log.created_at);
                    
                    return (
                        <tr key={log.id}>
                            <td className="td-date">
                                <strong>{dt.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}</strong>
                                <span>{dt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td>
                                <div className="td-text">
                                    <strong>{log.input_text}</strong>
                                    <div className="td-text-sub">
                                        <div />
                                        <span>نص إدخال مستخدم</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                            {log.source_url ? (
                                <a href={log.source_url} target="_blank" rel="noreferrer" className="td-link">
                                    <ExternalLink size={14} />
                                    رابط الخبر
                                </a>
                            ) : <span style={{ color: '#cbd5e1', fontWeight: 800 }}>—</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                            {getStatusBadge(log.result_status)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <div className="confidence-col">
                                    <span className={`confidence-val ${cType}`}>{log.confidence_score}%</span>
                                    <div className="confidence-bar">
                                        <div className={`confidence-fill ${cType}`} style={{ width: `${log.confidence_score}%` }} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
            </table>
        </div>

        {/* Pagination Dummy */}
        <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid var(--admin-border)', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--admin-text-light)', textTransform: 'uppercase' }}>عرض سجلات من التخزين</p>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                    <ChevronRight size={16} color="#64748b" />
                </button>
                <button style={{ padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                    <ChevronLeft size={16} color="#64748b" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLogs;
