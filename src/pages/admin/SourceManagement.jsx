import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ShieldCheck, Globe, CheckCircle } from 'lucide-react';
import '../../Admin.css';

const SourceManagement = () => {
  const [sources, setSources] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSources = () => {
    setLoading(true);
    fetch('https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=get_sources', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setSources(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    fetch('https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=add_source', {
      method: 'POST',
      body: JSON.stringify({ name: newName, domain: newDomain }),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    }).then(() => {
      setNewName('');
      setNewDomain('');
      fetchSources();
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصدر؟')) {
      fetch(`https://fakenewsv2-001-site1.gtempurl.com/api/admin.php?action=delete_source&id=${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(() => fetchSources());
    }
  };

  return (
    <div>
       {/* Page Header */}
       <div className="page-header">
        <div className="page-title-box">
           <p className="page-subtitle emerald">المصادر الموثوقة</p>
           <h2 className="page-title">تعزيز مصداقية النطاقات</h2>
        </div>
        <div className="info-badge">
            <div className="info-icon emerald">
                <CheckCircle size={24} />
            </div>
            <div className="info-text">
                <p>بيئة آمنة</p>
                <p>أي خبر من هذه المصادر يحصل على دفعة إيجابية</p>
            </div>
        </div>
      </div>

      {/* Add Form */}
      <div className="glass-card" style={{ padding: '40px', marginBottom: '40px', border: '1px solid #a7f3d0' }}>
        <form onSubmit={handleAdd} className="form-grid">
          <div className="admin-input-group">
            <label>اسم المؤسسة الإعلامية</label>
            <div className="input-wrapper">
                <span className="input-icon" style={{ right: 'auto', left: '16px' }}><ShieldCheck size={18} /></span>
                <input 
                    type="text" 
                    placeholder="مثلاً: الجزيرة، العربية، بي بي سي..."
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    required 
                />
            </div>
          </div>
          <div className="admin-input-group">
            <label>نطاق الدومين (بدون www)</label>
            <div className="input-wrapper">
                <span className="input-icon" style={{ right: 'auto', left: '16px' }}><Globe size={18} /></span>
                <input 
                    type="text" 
                    placeholder="مثال: aljazeera.net"
                    value={newDomain} 
                    onChange={e => setNewDomain(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                    required 
                />
            </div>
          </div>
          <div className="admin-input-group">
            <button type="submit" className="btn-premium btn-emerald">
              <Plus size={20} />
              حفظ
            </button>
          </div>
        </form>
      </div>

      {/* Sources list */}
      <div className="glass-card table-container" style={{ padding: 0 }}>
        <div className="table-header">
            <h3 className="table-title" style={{ gap: '12px' }}>
                <span style={{ display: 'block', width: '6px', height: '20px', background: 'var(--emerald-500)', borderRadius: '6px' }}></span>
                قائمة المصادر البيضاء
            </h3>
            <span className="table-count">{sources.length} مصدر</span>
        </div>
        
        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>#</th>
                <th>اسم المصدر</th>
                <th>النطاق المعتمد</th>
                <th style={{ textAlign: 'left' }}>تحكم</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>جاري تحميل القائمة...</td></tr>
              ) : sources.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>لا توجد سجلات للمصادر حتى الآن</td></tr>
              ) : sources.map((src, idx) => (
                <tr key={src.id}>
                  <td>{(idx + 1).toString().padStart(2, '0')}</td>
                  <td>
                    <div className="td-flex">
                      <div className="td-icon emerald">
                          <ShieldCheck size={18} />
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{src.source_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="td-badge-indigo">
                      <Globe size={14} />
                      {src.domain}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <button 
                      onClick={() => handleDelete(src.id)}
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

export default SourceManagement;
