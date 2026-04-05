import React from 'react';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('شكراً لرسالتك! هذا النموذج للعرض فقط في هذه النسخة.');
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>اتصل بنا</h1>
      </div>
      <div className="analysis-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم:</label>
            <input type="text" placeholder="اسمك الكريم" required />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني:</label>
            <input type="email" placeholder="example@gmail.com" required />
          </div>
          <div className="form-group">
            <label>الرسالة:</label>
            <textarea placeholder="كيف يمكننا مساعدتك؟" required></textarea>
          </div>
          <button type="submit" className="btn-primary">إرسال</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
