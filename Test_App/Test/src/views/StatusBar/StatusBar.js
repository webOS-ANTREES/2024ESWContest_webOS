import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSystemTime } from '../webOS_service/luna_service';
import css from './StatusBar.module.css';

const StatusBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState('');
  const [isMenuVisible, setMenuVisible] = useState(false); // 메뉴 표시 여부를 제어하는 상태

  // 뒤로 가기와 메뉴 버튼을 표시할 경로 목록
  const pathsWithBackButton = ['/monitoring', '/pestmanagement', '/systemcontrol', '/notice'];

  useEffect(() => {
    getSystemTime((err, time) => {
      if (!err) setCurrentTime(time);
    });

    const intervalId = setInterval(() => {
      getSystemTime((err, time) => {
        if (!err) setCurrentTime(time);
      });
    }, 1000); 

    return () => clearInterval(intervalId);
  }, []);

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible); // 메뉴의 보임/숨김을 토글
  };

  return (
    <div className={css.StatusBarContainer}>
      {/* 뒤로 가기 버튼이 특정 경로에서만 보이도록 조건 추가 */}
      {pathsWithBackButton.includes(location.pathname) && (
        <>
          <button onClick={() => navigate('/menu')} className={css.backButton}>
            뒤로 가기
          </button>

          {/* 메뉴 버튼도 같은 조건에서만 보이도록 */}
          <button onClick={toggleMenu} className={css.menuButton}>
            메뉴
          </button>
        </>
      )}
      
      {/* 현재 시간 표시 */}
      <div className={css.timeContainer}>현재 시간: {currentTime}</div>

      {/* 메뉴 팝업 */}
      {isMenuVisible && (
        <div className={css.menuPopup}>
          <button onClick={() => navigate('/monitoring')} className={css.menuItem}>모니터링</button>
          <button onClick={() => navigate('/pestmanagement')} className={css.menuItem}>병해충 관리</button>
          <button onClick={() => navigate('/systemcontrol')} className={css.menuItem}>시스템 제어</button>
          <button onClick={() => navigate('/notice')} className={css.menuItem}>알림</button>
        </div>
      )}
    </div>
  );
};

export default StatusBar;