import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './PestManagement.module.css';

const PestManagement = () => {
  const [client, setClient] = useState(null); // MQTT 클라이언트 상태 관리
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [data3, setData3] = useState(null);
  const [data4, setData4] = useState(null);
  const [data5, setData5] = useState(null);
  const [data6, setData6] = useState(null);
  const [data7, setData7] = useState(null);

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://192.168.50.248:1884'); // MQTT 브로커에 연결
    setClient(mqttClient); // client 상태 업데이트

    // 연결 후 특정 topic 구독
    mqttClient.on('connect', () => {
      mqttClient.subscribe('robot/location', (err) => {
        if (!err) {
          console.log('MQTT Subcribe Success');
        }
      });
    });

    // 메시지 수신 처리
    mqttClient.on('message', (topic, message) => {
      const receivedMessage = message.toString(); // 수신된 메시지를 문자열로 변환
      const dataArray = receivedMessage.split(',');

      if (dataArray.length === 7) {
        setData1(dataArray[0]);
        setData2(dataArray[1]);
        setData3(dataArray[2]);
        setData4(dataArray[3]);
        setData5(dataArray[4]);
        setData6(dataArray[5]);
        setData7(dataArray[6]);
      }
    });

    return () => {
      mqttClient.end();
    };
  }, []);

  // 버튼 클릭 시 메시지 전송 함수
  const handleSendMessage = () => {
    if (client) {
      client.publish('robot/location', 'ON', (err) => {
        if (err) {
          console.log('Fail', err);
        } else {
          console.log('Success');
        }
      });
    }
  };

  return (
    <div className={css.PestManagementContainer}>
      <div className={css.CCTVContainer}>
        <h1>CCTV</h1>
        <img
          className={css.CCTVImage}
          src="http://192.168.50.248:8080/video_feed"
          alt="Live video feed"
        />
      </div>

      <div className={css.PestManagementContent}>
        <div className={css.PestManagementItem}>
          <h2>병해충 관리</h2>
          <p>총 딸기 개수: {data1}</p>
          <p>익은 딸기 개수: {data2}</p>
          <p>익은 딸기 비율: {data3}%</p>
          <p>안 익은 딸기 개수: {data4}</p>
          <p>안 익은 딸기 비율: {data5}%</p>
          <p>병해충 걸린 딸기 개수: {data6}</p>
          <p>병해충 걸린 딸기 비율: {data7}%</p>
        </div>

        <button className={css.SendButton} onClick={handleSendMessage}>
          메시지 전송 (ON)
        </button>
      </div>
    </div>
  );
};

export default PestManagement;