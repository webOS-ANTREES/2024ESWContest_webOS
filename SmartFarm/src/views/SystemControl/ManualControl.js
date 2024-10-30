import css from './ManualControl.module.css';
import { sendToast } from '../webOS_service/luna_service';

const ManualControl = ({ client }) => {

  // 천창 제어 함수
  const handleSkylightOpen = () => {
    if (client) {
      client.publish('nodemcu/sky', 'ON');
      setTimeout(() => {
        sendToast("천창이 열렸습니다.");
      }, 1000);  // 1초 지연
    }
  };

  const handleSkylightClose = () => {
    if (client) {
      client.publish('nodemcu/sky', 'OFF');
      setTimeout(() => {
        sendToast("천창이 닫혔습니다.");
      }, 1000);  // 1초 지연
    }
  };

  // 내벽 제어 함수
  const handleInnerLeftSide = () => {
    if (client) {
      client.publish('nodemcu/side_left', 'OFF');
      setTimeout(() => {
        sendToast("왼쪽 내벽이 열렸습니다.");
      }, 3000);  // 3초 지연
    }
  };

  const handleInnerLeftSideClose = () => {
    if (client) {
      client.publish('nodemcu/side_left', 'ON');
      setTimeout(() => {
        sendToast("왼쪽 내벽이 닫혔습니다.");
      }, 3000);  // 3초 지연
    }
  };

  const handleInnerRightSide = () => {
    if (client) {
      client.publish('nodemcu/side_right', 'ON');
      setTimeout(() => {
        sendToast("오른쪽 내벽이 열렸습니다.");
      }, 3000);  // 3초 지연
    }
  };

  const handleInnerRightSideClose = () => {
    if (client) {
      client.publish('nodemcu/side_right', 'OFF');
      setTimeout(() => {
        sendToast("오른쪽 내벽이 닫혔습니다.");
      }, 3000);  // 3초 지연
    }
  };

  // 내벽 천장 제어 함수
  const handleInnerCeiling = () => {
    if (client) {
      client.publish('nodemcu/ceiling', 'OFF');
      setTimeout(() => {
        sendToast("내벽 천장이 열렸습니다.");
      }, 5000);  // 5초 지연
    }
  };

  const handleInnerCeilingClose = () => {
    if (client) {
      client.publish('nodemcu/ceiling', 'ON');
      setTimeout(() => {
        sendToast("내벽 천장이 닫혔습니다.");
      }, 5000);  // 5초 지연
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
          <button className={css.ControlButton} onClick={handleInnerLeftSide}>왼쪽 열기</button>
          <button className={css.ControlButton} onClick={handleInnerLeftSideClose}>왼쪽 닫기</button>
          <button className={css.ControlButton} onClick={handleInnerRightSide}>오른쪽 열기</button>
          <button className={css.ControlButton} onClick={handleInnerRightSideClose}>오른쪽 닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ManualControl;