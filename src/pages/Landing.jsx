import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  History,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="landing-wrapper">
      {/* Hero Section */}
      <section className="hero-section-premium">
        <div className="container hero-container">
          <h1>
            كاشف الأخبار الكاذبة <br />
            <span>حقيقتك في عالم رقمي</span>
          </h1>
          <p>
            توقف عن مشاركة الإشاعات. استخدم تقنيات التحليل الذكية لدينا للتأكد
            من مصداقية أي خبر عربي قبل نشره.
          </p>
          <div className="hero-actions">
            <Link to="/detector" className="btn-glow">
              ابدأ التحقق الآن
              <Search size={20} style={{ marginRight: "10px" }} />
            </Link>
            <Link to="/about" className="btn-outline">
              كيف يعمل النظام؟
            </Link>
          </div>
          <div className="hero-scroll-indicator">
            <span>اسحب للأسفل</span>
            <div className="mouse"></div>
          </div>
        </div>
      </section>

      {/* Trust Quote Section */}
      <section className="quote-section">
        <div className="container">
          <blockquote className="premium-quote">
            "الأخبار الكاذبة تنتشر أسرع بـ 6 مرات من الحقيقة.. كن أنت الفاصل."
          </blockquote>
        </div>
      </section>

      {/* Features - Card Style */}
      <section className="features-premium">
        <div className="container">
          <div className="section-header">
            <span className="subtitle">لماذا تختارنا؟</span>
            <h2 className="title">مميزات المنصة الذكية</h2>
          </div>

          <div className="features-grid-premium">
            <div className="feature-card-premium">
              <div className="icon-wrapper">
                <Search size={40} color="#10b981" />
              </div>
              <h3>دقة التحليل</h3>
              <p>
                نعتمد على خوارزميات فحص متقدمة للكشف عن العبارات المضللة
                والأساليب العاطفية.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="icon-wrapper">
                <ShieldCheck size={40} color="#3b82f6" />
              </div>
              <h3>مصادر عالمية</h3>
              <p>
                يتم مقارنة الأخبار مع أكثر من 500 وكالة أنباء ومصدر موثوق حول
                العالم.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="icon-wrapper">
                <BarChart3 size={40} color="#f59e0b" />
              </div>
              <h3>تقارير مفصلة</h3>
              <p>
                لا نعطيك النتيجة فقط، بل نشرح لك الأسباب التي جعلتنا نشك في
                مصداقية الخبر.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps - Timeline Style */}
      <section className="steps-premium">
        <div className="container">
          <h2 className="section-title">ثلاث خطوات لتصل للحقيقة</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot">
                <CheckCircle2 size={24} />
              </div>
              <div className="timeline-content">
                <h4>الصق النص</h4>
                <p>ضع نص الخبر أو الرابط المثير للجدل في المكان المخصص.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot">
                <History size={24} />
              </div>
              <div className="timeline-content">
                <h4>انتظر ثوانٍ</h4>
                <p>يقوم النظام بمسح آلاف البيانات والكلمات المفتاحية فوراً.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot">
                <AlertCircle size={24} />
              </div>
              <div className="timeline-content">
                <h4>احصل على اليقين</h4>
                <p>تظهر لك نتيجة واضحة مع نسبة الثقة والأسباب العلمية.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-box">
            <h2>جاهز لاستعادة الثقة في أخبارك؟</h2>
            <p>انضم لآلاف المستخدمين الذين يحمون عقولهم من التضليل يومياً.</p>
            <Link to="/detector" className="btn-white">
              جربه مجاناً الآن
              <ArrowRight size={20} style={{ marginRight: "10px" }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
