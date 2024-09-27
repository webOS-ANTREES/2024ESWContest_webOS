import { useEffect, useState } from 'react';
import css from './Notice.module.css'; // CSS 모듈 경로를 적절히 설정하세요.
import { toast } from '../../services/Luna_Service'; // Luna_Service.js에서 toast 함수 가져오기

const Notice = ({ newNotice }) => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    if (newNotice) {
      setNotices((prevNotices) => [...prevNotices, newNotice]);
      toast(newNotice); // 여기서 toast 함수를 호출하여 알림 표시
    }
  }, [newNotice]);

  return (
    <div className={css.noticeContainer}>
      <div className={css.noticeList}>
        <h2>알림</h2>
        <ul>
          {notices.map((notice, index) => (
            <li key={index}>{notice}</li>
          ))}
        </ul>
      </div>
      <div className={css.noticeDetails}>
        <h2>메시지 세부 정보</h2>
        {/* 메시지 세부 정보 표시 */}
      </div>
    </div>
  );
};

export default Notice;