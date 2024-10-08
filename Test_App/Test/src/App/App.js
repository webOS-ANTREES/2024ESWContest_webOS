import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login/Login';
import Monitoring from '../views/Monitoring/Monitoring';
import Notice from '../views/Notice/Notice';
import Navigation from '../views/Navigation/Navigation';
import PestManagement from '../views/PestManagement/PestManagement';
import SystemControl from '../views/SystemControl/SystemControl';
import StatusBar from '../views/StatusBar/StatusBar'; // 시스템 시간을 가져오는 함수 가져오기
import css from './App.module.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 상태 관리

  return (
    <Router>
      <div className={css.app}>
      <StatusBar />

        <Routes>
          {/* 로그인 성공 시 네비게이션이 표시되도록 setIsAuthenticated를 전달 */}
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/monitoring" element={isAuthenticated ? <Monitoring /> : <Navigate to="/" />} />
          <Route path="/notice" element={isAuthenticated ? <Notice /> : <Navigate to="/" />} />
          <Route path="/systemcontrol" element={isAuthenticated ? <SystemControl /> : <Navigate to="/" />} />
          <Route path="/pestmanagement" element={isAuthenticated ? <PestManagement /> : <Navigate to="/" />} />
        </Routes>

        {/* 로그인에 성공한 경우에만 네비게이션 표시 */}
        {isAuthenticated && <Navigation />}
      </div>
    </Router>
  );
};

export default App;