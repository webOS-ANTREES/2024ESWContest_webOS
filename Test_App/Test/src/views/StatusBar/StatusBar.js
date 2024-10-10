import { useEffect, useState } from 'react';
import { getSystemTime } from '../webOS_service/luna_service';
import css from './StatusBar.module.css';

const StatusBar = () => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        getSystemTime((err, time) => {
            if (!err) setCurrentTime(time);
        });

        const intervalId = setInterval(() => {
            getSystemTime((err, time) => {
                if (!err) setCurrentTime(time);
            });
        }, 1000); // 1초 간격으로 갱신

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={css.StatusBarContainer}>
            <div>이 상태바에는 어떤 것들이 들어가면 좋을까???{currentTime}</div>
        </div>
    );
};

export default StatusBar;