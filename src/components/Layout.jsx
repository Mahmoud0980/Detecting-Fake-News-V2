import React from "react";
import { NavLink } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <header>
        <div className="container">
          <nav>
            <ul>
              <li>
                <NavLink to="/">الرئيسية</NavLink>
              </li>
              <li>
                <NavLink to="/detector">المحلل الذكي</NavLink>
              </li>
              <li>
                <NavLink to="/about">عن المشروع</NavLink>
              </li>
              <li>
                <NavLink to="/contact">اتصل بنا</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer>
        <div className="container">
          <p>© 2026 كاشف الأخبار الكاذبة - </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
