import { useEffect, useState } from 'react';
import { getNotificationsFromDB, deleteNotificationFromDB } from '../webOS_service/luna_service';
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

    // 알림 삭제 함수
    const handleDelete = (_id) => {
        deleteNotificationFromDB(_id, (err) => {
            if (!err) {
                // 삭제 후 UI 업데이트
                setNotifications(notifications.filter(notification => notification._id !== _id));
            }
        });
    };

    return (
        <div className={css.NoticeContainer}>
            <h2>저장된 알림 목록</h2>
            <ul className={css.NotificationList}>
                {notifications.map((notification) => (
                    <li key={notification._id} className={css.NotificationItem}>
                        {notification.timestamp} - {notification.message}
                        <button className={css.DeleteButton} onClick={() => handleDelete(notification._id)}>삭제</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notice;