import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Link as LinkIcon, AlertCircle } from "lucide-react";

const Home = () => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("يرجى إدخال نص الخبر أولاً");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://jorjekhan-001-site1.site4future.com/api/analyze.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, url }),
        },
      );
      const data = await response.json();
      navigate("/result", { state: { result: data } });
    } catch (error) {
      console.error("Error analyzing news:", error);
      alert("حدث خطأ أثناء تحليل الخبر. تأكد من تشغيل الخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>المحلل الذكي للأخبار</h1>
        <p>
          قم بلصق النص أو الرابط أدناه للحصول على تقييم فوري لمصداقية المحتوى.
        </p>
      </div>

      <div className="analysis-form">
        <form onSubmit={handleAnalyze}>
          <div className="form-group">
            <label>نص الخبر:</label>
            <textarea
              placeholder="ضع نص الخبر هنا للتحليل..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>رابط المصدر (اختياري):</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="https://example.com/news..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ paddingRight: "40px" }}
              />
              <LinkIcon
                size={18}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "14px",
                  color: "#64748b",
                }}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "جاري التحليل..." : "بدء التحليل الآن"}
            <Search size={18} style={{ marginRight: "10px" }} />
          </button>
        </form>
      </div>

      <div className="info-cards">
        <div className="card">
          <div className="icon-wrapper-small">🔍</div>
          <h3>تحليل الكلمات</h3>
          <p>فحص الأنماط اللغوية والكلمات التي تشير إلى الأخبار المضللة.</p>
        </div>
        <div className="card">
          <div className="icon-wrapper-small">🛡️</div>
          <h3>توثيق المصدر</h3>
          <p>مطابقة النطاق مع قوائم بيضاء للمصادر الموثوقة والمعتمدة.</p>
        </div>
        <div className="card">
          <div className="icon-wrapper-small">📈</div>
          <h3>درجة اليقين</h3>
          <p>توفير نسبة مئوية دقيقة تعكس مدى مصداقية الخبر المحلل.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
