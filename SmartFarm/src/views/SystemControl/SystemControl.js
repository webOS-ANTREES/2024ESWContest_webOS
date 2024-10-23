import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './SystemControl.module.css';
import { getDatabase, ref, query, limitToLast, onValue } from 'firebase/database';
import { firebaseApp } from '../Firebase/Firebase';
import AutoControl from './AutoControl';
import ManualControl from './ManualControl';
import { putKind } from '../webOS_service/luna_service';

const SystemControl = () => {
  const [client, setClient] = useState(null);
  const [currentSensorData, setLatestSensorData] = useState(null);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://192.168.137.106:1884');  // MQTT 서버에 연결
    const todayDate = new Date().toISOString().split('T')[0];
    const database = getDatabase(firebaseApp);
    const sensorDataRef = query(ref(database, `sensorData/${todayDate}`), limitToLast(1));

    putKind(); // DB8에 Kind 생성 (최초 한 번 실행)
    setClient(mqttClient);

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
        const currentData = allData[allData.length - 1]; // 최신 데이터만 사용
        setLatestSensorData(currentData);
      } else {
        setLatestSensorData(null);
      }
    });

    return () => {
      mqttClient.end();  // 컴포넌트 unmount 시 MQTT 연결 해제
    };
  }, []);

  return (
    <div className={css.SystemControlContainer}>
      {/* 자동 제어 */}
      <AutoControl
        currentSensorData={currentSensorData}
        client={client}
      />

      {/* 수동 제어 */}
      <ManualControl
        client={client}
      />
    </div>
  );
};

export default SystemControl;