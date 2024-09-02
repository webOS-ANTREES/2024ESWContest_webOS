import kind from '@enact/core/kind';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login/Login';
import Monitoring from '../views/Monitoring/Monitoring';
import Alerts from '../views/Alerts/Alerts';
import Report from '../views/Report/Report';
import Navigation from '../views/Navigation/Navigation';
import PestManagement from '../views/PestManagement/PestManagement'; // 올바른 경로로 수정
import SystemControl from '../views/SystemControl/SystemControl';
import css from './App.module.css';


const App = kind({
  name: 'App',
  render: (props) => (
    <Router>
      <div className={css.app}>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/SystemControl" element={<SystemControl />} />
          <Route path="/PestManagement" element={<PestManagement />} />
          <Route path="/report" element={<Report />} />
        </Routes>
        <Navigation /> {/* 항상 네비게이션 버튼을 표시 */}
      </div>
    </Router>
  )
});

export default App;