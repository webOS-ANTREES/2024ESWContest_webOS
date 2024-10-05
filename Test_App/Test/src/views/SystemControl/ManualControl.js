import css from './ManualControl.module.css';
import { sendToast } from '../webOS_service/luna_service';

const ManualControl = ({ client, onToast }) => {
  const handlePestControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'ON');  // 천창 열기 메시지
      sendToast("천창이 열렸습니다!!"); // Toast 알림 전송
    }
  };

  const handleWallControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'OFF');  // 천창 닫기 메시지
      sendToast("천창이 닫혔습니다!!"); // Toast 알림 전송
    }
  };

  return (
    <div className={`${css.SystemControlItem} ${css.ManualControl}`}>
      <h3>수동 제어</h3>
      <div className={css.ControlButtonContainer}>
        <button className={css.ControlButton} onClick={handlePestControlClick}>
          열기
        </button>
        <button className={css.ControlButton} onClick={handleWallControlClick}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ManualControl;
