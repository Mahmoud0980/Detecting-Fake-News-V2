import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, Database, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import '../../Admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jorjekhan-001-site1.site4future.com/api/admin.php?action=get_stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', fontWeight: 'bold' }}>
      جاري تحميل البيانات...
    </div>
  );

  const cards = [
    { title: 'إجمالي التحليات', value: stats?.total_analyses || 0, icon: BarChart3, color: 'indigo', trend: '+12%' },
    { title: 'كلمات مفتاحية', value: stats?.total_keywords || 0, icon: ShieldAlert, color: 'rose', trend: 'نشط' },
    { title: 'مصادر موثوقة', value: stats?.total_sources || 0, icon: Database, color: 'emerald', trend: '+3' },
  ];

  return (
    <div>
      <div className="dashboard-grid">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card stat-card">
              <div className="stat-bg-icon">
                <Icon size={120} />
              </div>
              
              <div className="stat-header">
                <div className={`stat-icon ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div className="stat-trend">
                    <TrendingUp size={14} />
                    {card.trend}
                </div>
              </div>

              <div className="stat-body">
                <p>{card.title}</p>
                <p>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-details-grid">
        <div className="glass-card">
          <h3 className="card-title">توزيع دقة البيانات</h3>
          
          <div>
            {stats?.status_distribution?.map((item, idx) => {
                const percentage = Math.round((item.count / stats.total_analyses) * 100);
                const colors = { 'trusted': 'trusted', 'fake': 'fake', 'uncertain': 'uncertain', 'invalid': 'invalid' };
                const labels = { 'trusted': 'موثوقة', 'fake': 'كاذبة', 'uncertain': 'غير مؤكدة', 'invalid': 'غير صالحة' };
                
                return (
                    <div key={idx} className="progress-item">
                        <div className="progress-header">
                            <span className="progress-label">{labels[item.result_status] || item.result_status}</span>
                            <div className="progress-stats">
                                <span>العدد الحقيقي</span>
                                <span>{item.count}</span>
                            </div>
                        </div>
                        <div className="progress-bar-bg">
                            <div 
                                className={`progress-bar-fill ${colors[item.result_status] || 'indigo'}`} 
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="progress-percent">{percentage}% من الإجمالي</span>
                    </div>
                );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="glass-card advice-card">
                <h3 className="card-title"><Activity size={24}/> نصيحة أمنية</h3>
                <p className="advice-text">
                    "تأكد من مراجعة سجلات التحليلات (Analysis Logs) يومياً لرصد الأنماط الجديدة من الأخبار المضللة التي قد تتطلب إضافة كلمات مفتاحية جديدة."
                </p>
                <div className="advice-highlight">
                    <div className="advice-highlight-icon">
                        <ArrowUpRight size={20} />
                    </div>
                    <p style={{ fontWeight: 800 }}>تحديث قاعدة البيانات يزيد الدقة بنسبة 40%</p>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>حالة النظام</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--emerald-500)', borderRadius: '50%' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--emerald-600)', textTransform: 'uppercase' }}>خادم متصل</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>سرعة الرد</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>120ms</p>
                    </div>
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>دقة النظام</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>94.2%</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
