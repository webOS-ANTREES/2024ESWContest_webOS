import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login/Login';
import SignUp from '../views/SignUp/SignUp';
import Monitoring from '../views/Monitoring/Monitoring';
import Notice from '../views/Notice/Notice';
import PestManagement from '../views/PestManagement/PestManagement';
import SystemControl from '../views/SystemControl/SystemControl';
import StatusBar from '../views/StatusBar/StatusBar';
import MenuPage from '../views/MenuPage/MenuPage';
import css from './App.module.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 상태
  const [userName, setUserName] = useState('');  // 사용자 이름 상태

  return (
    <Router>
      <div className={css.app}>
        <StatusBar />

        <Routes>
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} setUserName={setUserName} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/menu" element={isAuthenticated ? <MenuPage userName={userName} /> : <Navigate to="/" />} />
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