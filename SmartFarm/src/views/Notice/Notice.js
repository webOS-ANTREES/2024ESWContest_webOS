import { useEffect, useState } from 'react';
import { getNotificationsFromDB, deleteNotificationFromDB } from '../webOS_service/luna_service';
import robotArmOnIcon from '../../../resources/images/RobotArmOn.png';
import robotArmOffIcon from '../../../resources/images/RobotArmOff.png';
import strawBerryIcon from '../../../resources/images/StrawBerry.png';
import deleteIcon from '../../../resources/images/Delete.png';
import noticeList_1 from '../../../resources/images/NoticeList_1.png';
import noticeList_2 from '../../../resources/images/NoticeList_2.png';
import systemControlIcon from '../../../resources/images/SystemControl.png';
import skyOpenIcon from '../../../resources/images/SkyOpen.png';
import skyCloseIcon from '../../../resources/images/SkyClose.png';
import ceilingOpenIcon from '../../../resources/images/CeilingOpen.png';
import ceilingCloseIcon from '../../../resources/images/CeilingClose.png';
import sideOpenIcon from '../../../resources/images/SideOpen.png';
import sideCloseIcon from '../../../resources/images/SideClose.png';
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

  // 아이콘 결정 함수
  const getNotificationIcon = (message) => {
    const iconMap = {
        "딸기 상태 및 병해충 판별을 시작합니다.": robotArmOnIcon,
        "딸기 상태 및 병해충 판별을 종료합니다.": robotArmOffIcon,
        "자동 수확 및 방제를 시작합니다.": strawBerryIcon,
        "제어 조건을 변경하였습니다.": systemControlIcon,
        "천창이 자동으로 열렸습니다.": skyOpenIcon,
        "천창이 자동으로 닫혔습니다.": skyCloseIcon,
        "천창이 열렸습니다.": skyOpenIcon,
        "천창이 닫혔습니다.": skyCloseIcon,
        "내벽 천장이 자동으로 열렸습니다.": ceilingOpenIcon,
        "내벽 천장이 자동으로 닫혔습니다.": ceilingCloseIcon,
        "내벽 천장이 열렸습니다.": ceilingOpenIcon,
        "내벽 천장이 닫혔습니다.": ceilingCloseIcon,
        "내벽이 자동으로 열렸습니다.": sideOpenIcon,
        "왼쪽 내벽이 열렸습니다.": sideOpenIcon,
        "오른쪽 내벽이 열렸습니다.": sideOpenIcon,
        "내벽이 자동으로 닫혔습니다.": sideCloseIcon,
        "왼쪽 내벽이 닫혔습니다.": sideCloseIcon,
        "오른쪽 내벽이 닫혔습니다.": sideCloseIcon
    };

    // '자동으로' 포함 여부를 무시하고 처리
    for (const [key, icon] of Object.entries(iconMap)) {
      if (message.includes(key.replace("열렸습니다.", "자동으로 열렸습니다.")) || message.includes(key)) {
        return icon;
      }
    }

    return null; // 아무 조건도 해당하지 않으면 null 반환
  };

  return (
    <div className={css.NoticeContainer}>
        <h2 className={css.titleWithIcons}>
            <img src={noticeList_1} alt="왼쪽 아이콘" className={css.Icon} />
            알림 목록
            <img src={noticeList_2} alt="오른쪽 아이콘" className={css.Icon} />
        </h2>
        <ul className={css.NotificationList}>
            {notifications.map((notification) => (
                <li key={notification._id} className={css.NotificationItem}>
                    <img src={getNotificationIcon(notification.message)} alt="알림 아이콘" className={css.NotificationIcon} />
                    <div className={css.NotificationMessage}>
                        {notification.message}
                    </div>
                    <div className={css.NotificationTime}>
                        {notification.timestamp}
                    </div>
                    <button className={css.DeleteButton} onClick={() => handleDelete(notification._id)}>
                        <img src={deleteIcon} alt="삭제" className={css.DeleteIcon} />
                    </button>
                </li>
            ))}
        </ul>
    </div>
    );
};

export default Notice;
