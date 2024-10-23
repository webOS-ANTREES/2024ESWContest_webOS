import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './SystemControl.module.css';
import AutoControl from './AutoControl';
import ManualControl from './ManualControl';
import { putKind } from '../webOS_service/luna_service';

const SystemControl = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://172.20.49.75:1884');  // MQTT 서버에 연결

    putKind(); // DB8에 Kind 생성 (최초 한 번 실행)
    setClient(mqttClient);

    return () => {
      mqttClient.end();  // 컴포넌트 unmount 시 MQTT 연결 해제
    };
  }, []);

  return (
    <div className={css.SystemControlContainer}>
      {/* 자동 제어 */}
      <AutoControl
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