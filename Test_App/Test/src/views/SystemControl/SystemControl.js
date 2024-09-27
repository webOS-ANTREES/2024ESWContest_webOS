import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import css from './SystemControl.module.css';
import { getDatabase, ref, query, limitToLast, onValue } from 'firebase/database';
import { firebaseApp } from '../../Firebase';
import AutoControl from './AutoControl';
import ManualControl from './ManualControl';
import Notice from '../Notice/Notice'; // Notice 컴포넌트 추가
import { sendAlert } from '../../services/luna_service';    // Luna_Service에서 sendAlert 가져오기

const SystemControl = () => {
  const [client, setClient] = useState(null);
  const [currentSensorData, setLatestSensorData] = useState(null);
  
  // 내벽 제어 상태
  const [isInnerWall1Open, setIsInnerWall1Open] = useState(false);
  const [isInnerWall2Open, setIsInnerWall2Open] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://172.20.48.180:1884');
    setClient(mqttClient);

    const todayDate = new Date().toISOString().split('T')[0];
    const database = getDatabase(firebaseApp);
    const sensorDataRef = query(ref(database, `sensorData/${todayDate}`), limitToLast(1));

    onValue(sensorDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allData = [];
        Object.keys(data).forEach(timeKey => {
          const timeData = data[timeKey];
          const innerKeys = Object.keys(timeData);
          innerKeys.forEach(innerKey => {
            allData.push({
              ...timeData[innerKey],
              timeKey: timeKey,
              key: innerKey
            });
          });
        });
        const currentData = allData[allData.length - 1];
        setLatestSensorData(currentData);  // 최신 데이터를 설정
      } else {
        setLatestSensorData(null);
      }
    });

    return () => {
      mqttClient.end();  // 컴포넌트 unmount 시 MQTT 연결 해제
    };
  }, []);

  const handleInnerWall1Control = () => {
    if (client) {
      if (isInnerWall1Open) {
        client.publish('nodemcu/innerWall1', 'CLOSE');  // 내벽 1 닫기 메시지
        setIsInnerWall1Open(false);
        sendAlert("내벽 1이 닫혔습니다."); // 알림 추가
      } else {
        client.publish('nodemcu/innerWall1', 'OPEN');  // 내벽 1 열기 메시지
        setIsInnerWall1Open(true);
        sendAlert("내벽 1이 열렸습니다."); // 알림 추가
      }
    }
  };

  const handleInnerWall2Control = () => {
    if (client) {
      if (isInnerWall2Open) {
        client.publish('nodemcu/innerWall2', 'CLOSE');  // 내벽 2 닫기 메시지
        setIsInnerWall2Open(false);
        sendAlert("내벽 2가 닫혔습니다."); // 알림 추가
      } else {
        client.publish('nodemcu/innerWall2', 'OPEN');  // 내벽 2 열기 메시지
        setIsInnerWall2Open(true);
        sendAlert("내벽 2가 열렸습니다."); // 알림 추가
      }
    }
  };

  return (
    <div className={css.SystemControlContainer}>
      <AutoControl 
        currentSensorData={currentSensorData} 
        client={client} 
      />
      <ManualControl 
        client={client} 
      />
      
      {/* 내벽 제어 UI */}
      <div className={`${css.SystemControlItem} ${css.InnerWallControl1}`}>
        <h2>내벽 제어 1</h2>
        <div className={css.ControlButtonContainer}>
          <button className={css.ControlButton} onClick={() => handleInnerWall1Control('OPEN')}>
            열기
          </button>
          <button className={css.ControlButton} onClick={() => handleInnerWall1Control('CLOSE')}>
            닫기
          </button>
        </div>
      </div>
      <div className={`${css.SystemControlItem} ${css.InnerWallControl2}`}>
        <h2>내벽 제어 2</h2>
        <div className={css.ControlButtonContainer}>
          <button className={css.ControlButton} onClick={() => handleInnerWall2Control('OPEN')}>
            열기
          </button>
          <button className={css.ControlButton} onClick={() => handleInnerWall2Control('CLOSE')}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default SystemControl;
