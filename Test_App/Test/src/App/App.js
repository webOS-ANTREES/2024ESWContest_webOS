import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login/Login';
import Monitoring from '../views/Monitoring/Monitoring';
import Notice from '../views/Notice/Notice';
import PestManagement from '../views/PestManagement/PestManagement';
import SystemControl from '../views/SystemControl/SystemControl';
import StatusBar from '../views/StatusBar/StatusBar'; // 시스템 시간을 가져오는 함수 가져오기
import MenuPage from '../views/MenuPage/MenuPage'; // 새로 만든 메뉴 페이지 가져오기
import css from './App.module.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 상태 관리

  return (
    <Router>
      <div className={css.app}>
        <StatusBar />

        <Routes>
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/menu" element={isAuthenticated ? <MenuPage /> : <Navigate to="/" />} />

          <Route path="/monitoring" element={isAuthenticated ? <Monitoring /> : <Navigate to="/" />} />
          <Route path="/notice" element={isAuthenticated ? <Notice /> : <Navigate to="/" />} />
          <Route path="/systemcontrol" element={isAuthenticated ? <SystemControl /> : <Navigate to="/" />} />
          <Route path="/pestmanagement" element={isAuthenticated ? <PestManagement /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
