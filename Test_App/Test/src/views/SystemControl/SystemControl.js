import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './SystemControl.module.css';

const SystemControl = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // WebSocket을 사용하여 MQTT 브로커에 연결
    const mqttClient = mqtt.connect('ws://172.20.48.180:1884');

    // MQTT 클라이언트를 상태에 저장
    setClient(mqttClient);

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      mqttClient.end();
    };
  }, []);

  const handlePestControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'ON'); // 병해충 관리 클릭 시 모터 구동
    }
  };

  const handleWallControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'OFF'); // 외벽 제어 클릭 시 모터 반대로 돌리기
    }
  };

  return (
    <div className={css.SystemControlContainer}>
      <div className={`${css.SystemControlItem} ${css.SkylightControl}`}>
        <h2>천창제어</h2>
        <div className={css.AutoControl}>
          <h3>자동제어</h3>
          <div className={css.InputGrid}>
            <div className={css.InputGroup}>
              <label>온도:</label>
              <input type="number" className={css.InputField} />
            </div>
            <div className={css.InputGroup}>
              <label>습도:</label>
              <input type="number" className={css.InputField} />
            </div>
            <div className={css.InputGroup}>
              <label>CO2:</label>
              <input type="number" className={css.InputField} />
            </div>
            <div className={css.InputGroup}>
              <label>조도:</label>
              <input type="number" className={css.InputField} />
            </div>
          </div>
        </div>
        <div className={css.ManualControl}>
          <h3>수동제어</h3>
          <div className={css.ControlButtonContainer}>
            <button className={css.ControlButton} onClick={handlePestControlClick}>
              ON
            </button>
            <button className={css.ControlButton} onClick={handleWallControlClick}>
              OFF
            </button>
          </div>
        </div>
      </div>
      <div className={`${css.SystemControlItem} ${css.InnerWallControl1}`}>
        <h2>내벽제어 1</h2>
      </div>
      <div className={`${css.SystemControlItem} ${css.InnerWallControl2}`}>
        <h2>내벽제어 2</h2>
      </div>
    </div>
  );
};

export default SystemControl;
