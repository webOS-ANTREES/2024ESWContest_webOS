import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './PestManagement.module.css';

const PestManagement = () => {
  const [setClient] = useState(null); // MQTT 클라이언트 상태 관리
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [data3, setData3] = useState(null);
  const [data4, setData4] = useState(null);
  const [data5, setData5] = useState(null);
  const [data6, setData6] = useState(null);
  const [data7, setData7] = useState(null);

  useEffect(() => {
    // MQTT 브로커에 연결
    const mqttClient = mqtt.connect('ws://172.20.48.180:1884');
    setClient(mqttClient); // client 상태 업데이트

    // 연결 후 특정 토픽을 구독
    mqttClient.on('connect', () => {
      mqttClient.subscribe('robot/location', (err) => {
        if (!err) {
          console.log('MQTT 구독 성공');
        }
      });
    });

    // 메시지 수신 처리
    mqttClient.on('message', (topic, message) => {
      const receivedMessage = message.toString(); // 수신된 메시지를 문자열로 변환

      // 데이터가 '20,16,80,4,20' 형식으로 온다고 가정하고 파싱
      const dataArray = receivedMessage.split(','); // 콤마로 구분하여 배열로 만듦

      // 각 데이터를 개별 변수에 저장
      if (dataArray.length === 7) { // 7개의 데이터가 정확히 존재하는 경우
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
      mqttClient.end(); // 컴포넌트 언마운트 시 MQTT 연결 해제
    };
  }, []);

  return (
    <div className={css.PestManagementContainer}>
      <h1>CCTV</h1>
      <img src="http://192.168.50.31:8080/video_feed" width="50%" alt="Live video feed" />

      <div className={css.PestManagementContent}>
        <div className={css.PestManagementItem}>
          <h2>병해충 관리</h2>
          <p>총 딸기 개수: {data1}</p> {/* 각 데이터를 개별적으로 출력 */}
          <p>익은 딸기 개수: {data2}</p>
          <p>익은 딸기 비율: {data3}%</p>
          <p>안 익은 딸기 개수: {data4}</p>
          <p>안 익은 딸기 비율: {data5}%</p>
          <p>병해충 걸린 딸기 개수: {data6}</p>
          <p>병해충 걸린 딸기 비율: {data7}%</p>
        </div>
      </div>
    </div>
  );
};

export default PestManagement;