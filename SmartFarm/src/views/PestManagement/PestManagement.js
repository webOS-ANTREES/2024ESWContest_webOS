import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { sendToast } from '../webOS_service/luna_service';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import cameraIcon from '../../../resources/images/Camera.png';
import robotArmIcon from '../../../resources/images/RobotArm.png';
import strawBerryIcon from '../../../resources/images/StrawBerry.png';
import css from './PestManagement.module.css';

// 플러그인 등록
Chart.register(ChartDataLabels);

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
    const mqttClient = mqtt.connect('ws://172.20.49.75:1884'); // MQTT 브로커에 연결
    setClient(mqttClient); // client 상태 업데이트

    // 연결 후 topic 구독
    mqttClient.on('connect', () => {
      mqttClient.subscribe('berry/number', (err) => {
        if (!err) {
          console.log('MQTT Subcribe Success');
        }
      });

      mqttClient.publish('berry/number', 'givedata', (err) => {
        if (!err) {
          console.log('Give Data Request Sent');
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

  // 원형 차트에 비율만 표시 (data3, data5, data7 비율)
  const chartData = {
    labels: ['익은 딸기 %', '안 익은 딸기 %', '병해충 걸린 %'],
    datasets: [
      {
        label: '딸기 상태 비율',
        data: [data3, data5, data7],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 16,
          },
        },
      },
      title: {
        display: true,
        text: '딸기 상태 비율',
        font: {
          size: 24,
        },
      },
      datalabels: {
        formatter: (value) => `${value}%`,
        color: '#fff',
        font: {
          size: 20,
          weight: 'bold',
        },
        display: true,
        anchor: 'center',
        align: 'center',
      },
    },
  };

  // ON 메시지 전송 함수
  const handleSendMessageOn = () => {
    if (client) {
      client.publish('robot/location', 'ON');
      sendToast("딸기 상태 및 병해충 판별을 시작합니다.");
    }
  };

  // OFF 메시지 전송 함수
  const handleSendMessageOff = () => {
    if (client) {
      client.publish('robot/location', 'OFF');
      sendToast("딸기 상태 및 병해충 판별을 종료합니다.");
    }
  };

  const handleSendHARVOn = () => {
    if (client) {
      client.publish('robot/location', 'HARV');
      sendToast("자동 수확 및 방제를 시작합니다.");
    }
  };

  return (
    <div className={css.PestManagementContainer}>
      <div className={css.CCTVContainer}>
        <img src={cameraIcon} alt="CCTV 아이콘" className={css.CCTVIcon} />
        <h1>CAM</h1>
        <img
          className={css.CCTVImage}
          src="http://192.168.50.104:8080/video_feed"
          alt="Live video feed"
        />
      </div>

      <div className={css.PestManagementContent}>
        <div className={css.PestManagementItem}>
          <div style={{ height: '450px', width: '600px' }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
          {/* 원 그래프 아래에 개수 표시 */}
          <div className={css.dataSummary}>
            <p>총 딸기 개수: {data1}</p>
            <p>익은 딸기 개수: {data2}</p>
            <p>안 익은 딸기 개수: {data4}</p>
            <p>병해충 걸린 딸기 개수: {data6}</p>
          </div>
        </div>

        <div className={css.buttonContainer}>
          <button className={css.SendButton} onClick={handleSendMessageOn}>
            <img src={robotArmIcon} alt="ON 아이콘" className={css.icon} />
            <span className={css.buttonText}>ON</span>
          </button>
          <button className={css.SendButton} onClick={handleSendMessageOff}>
            <img src={robotArmIcon} alt="OFF 아이콘" className={css.icon} />
            <span className={css.buttonText}>OFF</span>
          </button>
          <button className={css.SendButton} onClick={handleSendHARVOn}>
            <img src={strawBerryIcon} alt="HARV 아이콘" className={css.icon} />
            <span className={css.buttonText}>수확/방제</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PestManagement;