import css from './ManualControl.module.css';
import { sendToast } from '../webOS_service/luna_service';

const ManualControl = ({ client }) => {

  // 천창 제어 함수
  const handleSkylightOpen = () => {
    if (client) {
      client.publish('nodemcu/sky', 'ON');  // 천창 열기 메시지
      sendToast("천창이 열렸습니다."); // Toast 알림 전송
    }
  };

  const handleSkylightClose = () => {
    if (client) {
      client.publish('nodemcu/sky', 'OFF');  // 천창 닫기 메시지
      sendToast("천창이 닫혔습니다."); // Toast 알림 전송
    }
  };

  // 내벽 사이드 제어 함수
  const handleInnerSide = () => {
    if (client) {
      client.publish('nodemcu/side', 'ON');  // 내벽 사이드 열기 메시지
      sendToast("내벽 사이드가 열렸습니다.");
    }
  };

  const handleInnerSideClose = () => {
    if (client) {
      client.publish('nodemcu/side', 'OFF');  // 내벽 사이드 닫기 메시지
      sendToast("내벽 사이드가 닫혔습니다.");
    }
  };

  // 내벽 천장 제어 함수
  const handleInnerCeiling = () => {
    if (client) {
      client.publish('nodemcu/ceiling', 'ON');  // 내벽 천장 열기 메시지
      sendToast("내벽 천장이 열렸습니다.");
    }
  };

  const handleInnerCeilingClose = () => {
    if (client) {
      client.publish('nodemcu/ceiling', 'OFF');  // 내벽 천장 닫기 메시지
      sendToast("내벽 천장이 닫혔습니다.");
    }
  };

  return (
    <div className={css.SystemControlContainer}>
      {/* 천창 제어 */}
      <div className={css.SystemControlItem}>
        <h4>천창 수동 제어</h4>
        <div className={css.ControlButtonContainer}>
          <button className={css.ControlButton} onClick={handleSkylightOpen}>열기</button>
          <button className={css.ControlButton} onClick={handleSkylightClose}>닫기</button>
        </div>
      </div>

      {/* 내벽 천장 제어 */}
      <div className={css.SystemControlItem}>
        <h4>내벽 천장 수동 제어</h4>
        <div className={css.ControlButtonContainer}>
          <button className={css.ControlButton} onClick={handleInnerCeiling}>열기</button>
          <button className={css.ControlButton} onClick={handleInnerCeilingClose}>닫기</button>
        </div>
      </div>

      {/* 내벽 제어 */}
      <div className={css.SystemControlItem}>
        <h4>내벽 수동 제어</h4>
        <div className={css.ControlButtonContainer}>
          <button className={css.ControlButton} onClick={handleInnerSide}>열기</button>
          <button className={css.ControlButton} onClick={handleInnerSideClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ManualControl;