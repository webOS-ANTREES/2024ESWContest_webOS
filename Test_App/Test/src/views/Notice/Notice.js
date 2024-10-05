import { useEffect, useState } from 'react';
import { getNotificationsFromDB } from '../webOS_service/luna_service';
import css from './Notice.module.css';

const Notice = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        getNotificationsFromDB((err, results) => {
            if (!err) {
                setNotifications(results);
            }
        });
    }, []);

    return (
        <div className={css.NoticeContainer}>
            <h2>저장된 알림 목록</h2>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>
                        {notification.timestamp} - {notification.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notice;
