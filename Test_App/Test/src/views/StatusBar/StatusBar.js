import { useEffect, useState } from 'react';
import { getSystemTime } from '../webOS_service/luna_service';
import css from './StatusBar.module.css';

const StatusBar = () => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        getSystemTime((err, time) => {
            if (!err) setCurrentTime(time);
        });

        const intervalId = setInterval(getSystemTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={css.StatusBarContainer}>
            <div>LOL{currentTime}</div>
        </div>
    );
};

export default StatusBar;