import React, { useState, useEffect } from 'react';
import { Trash2, Plus, AlertTriangle, Hash, Activity } from 'lucide-react';
import '../../Admin.css';

const KeywordManagement = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newWeight, setNewWeight] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchKeywords = () => {
    setLoading(true);
    fetch('https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=get_keywords', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setKeywords(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setKeywords([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    fetch('https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=add_keyword', {
      method: 'POST',
      body: JSON.stringify({ keyword: newKeyword, weight: newWeight }),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    }).then(() => {
      setNewKeyword('');
      fetchKeywords();
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
      fetch(`https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=delete_keyword&id=${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(() => fetchKeywords());
    }
  };

  return (
    <div>
      {/* Intro Header */}
      <div className="page-header">
        <div className="page-title-box">
           <p className="page-subtitle indigo">التحكم في الخوارزمية</p>
           <h2 className="page-title">إدارة الكلمات المشبوهة</h2>
        </div>
        <div className="info-badge">
            <div className="info-icon amber">
                <AlertTriangle size={24} />
            </div>
            <div className="info-text">
                <p>تنبيه هام</p>
                <p>احذر من حذف الكلمات المحورية، فقد يؤدي ذلك لتقويض دقة النظام بشكل مفاجئ.</p>
            </div>
        </div>
      </div>

      {/* Add Form */}
      <div className="glass-card" style={{ padding: '40px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div className="info-icon indigo" style={{ background: 'var(--indigo-500)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                <Plus size={20} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>إضافة بصمة مشبوهة جديدة</h3>
        </div>

        <form onSubmit={handleAdd} className="form-grid">
          <div className="admin-input-group">
            <label>النص أو الكلمة</label>
            <div className="input-wrapper">
                <span className="input-icon" style={{ right: 'auto', left: '16px' }}><Activity size={18} /></span>
                <input 
                    type="text" 
                    placeholder="مثل: انشرها فوراً، هام للغاية، تم تسريبه..."
                    value={newKeyword} 
                    onChange={e => setNewKeyword(e.target.value)}
                    required 
                />
            </div>
          </div>
          <div className="admin-input-group">
            <label>الوزن العقابي</label>
            <div className="input-wrapper">
                <span className="input-icon" style={{ right: 'auto', left: '16px' }}><Hash size={18} /></span>
                <input 
                    type="number" 
                    value={newWeight} 
                    onChange={e => setNewWeight(e.target.value)}
                    required 
                />
            </div>
          </div>
          <div className="admin-input-group">
            <button type="submit" className="btn-premium">
              إضافة
            </button>
          </div>
        </form>
      </div>

      {/* Keywords Table */}
      <div className="glass-card table-container" style={{ padding: 0 }}>
        <div className="table-header">
          <h3 className="table-title">سجل الكلمات المرصودة</h3>
          <span className="table-count">{keywords.length} كلمة نشطة</span>
        </div>
        
        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الكلمة / العبارة</th>
                <th style={{ textAlign: 'center' }}>قوة التأثير</th>
                <th style={{ textAlign: 'left' }}>تحكم</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>جاري تحميل البيانات...</td></tr>
              ) : keywords.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>لم يتم تعريف كلمات بعد</td></tr>
              ) : keywords.map((kw, idx) => (
                <tr key={kw.id}>
                  <td>{(idx + 1).toString().padStart(2, '0')}</td>
                  <td>
                    <div className="td-flex">
                        <div className="td-icon">
                            <Activity size={18} />
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{kw.keyword}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="td-badge-rose">
                        -{kw.weight}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <button 
                      onClick={() => handleDelete(kw.id)}
                      className="btn-delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeywordManagement;
