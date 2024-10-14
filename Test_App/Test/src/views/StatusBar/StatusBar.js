import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getSystemTime } from '../webOS_service/luna_service';
import css from './StatusBar.module.css';

const StatusBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState('');
  const [isMenuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
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
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuVisible((prevVisible) => !prevVisible); // 메뉴 보임/숨김 toggle
  };

  const handleBackClick = () => {
    setMenuVisible(false); // 메뉴를 숨기기
    navigate('/menu');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // menuButton이나 menuPopup 영역 이외 영역 클릭했을 때 닫기
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className={css.StatusBarContainer}>
      {pathsWithBackButton.includes(location.pathname) && (
        <>
          <button onClick={handleBackClick} className={css.backButton}>
            뒤로 가기
          </button>
          <button ref={menuButtonRef} onClick={toggleMenu} className={css.menuButton}>
            메뉴
          </button>
        </>
      )}

      <div className={css.timeContainer}>현재 시간: {currentTime}</div>

      {isMenuVisible && (
        <div ref={menuRef} className={css.menuPopup}>
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