import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSystemTime } from '../webOS_service/luna_service';
import backButton from '../../../resources/images/BackButton.png';
import css from './StatusBar.module.css';

const StatusBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState('');
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

  const handleBackClick = () => {
    navigate('/menu');
  };

  return (
    <div className={css.StatusBarContainer}>
      {pathsWithBackButton.includes(location.pathname) && (
        <>
          <button onClick={handleBackClick} className={css.backButton}>
            <img src={backButton} alt="Back" />
          </button>
        </>
      )}

      <div className={css.timeContainer}>{currentTime}</div>
    </div>
  );
};

export default StatusBar;