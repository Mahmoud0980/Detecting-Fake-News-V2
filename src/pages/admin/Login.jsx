import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ShieldCheck, ChevronLeft } from 'lucide-react';
import '../../Admin.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('https://jorjekhan-001-site1.site4future.com/api/admin.php?action=login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                navigate('/admin');
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        } catch (err) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" dir="rtl">
            <div className="login-blob-1" />
            <div className="login-blob-2" />

            <div className="login-card animate-fade">
                <div className="login-header">
                    <div className="login-logo">
                        <ShieldCheck size={40} />
                    </div>
                    <h2>نظام الإدارة</h2>
                    <p>أمان ذكي. كشف فوري.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="login-form-group">
                        <label>اسم المستخدم</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><User size={20} /></span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="اسم المستخدم"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label>كلمة المرور</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><Lock size={20} /></span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="login-error animate-fade">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-btn"
                    >
                        {loading ? 'جاري التحقق...' : (
                            <>
                                <span>تسجيل الدخول</span>
                                <ChevronLeft size={20} />
                            </>
                        )}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                    نظام حماية المحتوى &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default Login;
