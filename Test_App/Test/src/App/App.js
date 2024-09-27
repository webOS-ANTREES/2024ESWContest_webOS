import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login/Login';
import Monitoring from '../views/Monitoring/Monitoring';
import Alerts from '../views/Notice/Notice';
import Report from '../views/Report/Report';
import Navigation from '../views/Navigation/Navigation';
import PestManagement from '../views/PestManagement/PestManagement';
import SystemControl from '../views/SystemControl/SystemControl';
import css from './App.module.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 상태 관리

  return (
    <Router>
      <div className={css.app}>
        <Routes>
          {/* 로그인 성공 시 네비게이션이 표시되도록 setIsAuthenticated를 전달 */}
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/monitoring" element={isAuthenticated ? <Monitoring /> : <Navigate to="/" />} />
          <Route path="/alerts" element={isAuthenticated ? <Alerts /> : <Navigate to="/" />} />
          <Route path="/systemcontrol" element={isAuthenticated ? <SystemControl /> : <Navigate to="/" />} />
          <Route path="/pestmanagement" element={isAuthenticated ? <PestManagement /> : <Navigate to="/" />} />
          <Route path="/report" element={isAuthenticated ? <Report /> : <Navigate to="/" />} />
        </Routes>

        {/* 로그인에 성공한 경우에만 네비게이션 표시 */}
        {isAuthenticated && <Navigation />}
      </div>
    </Router>
  );
};

export default App;
