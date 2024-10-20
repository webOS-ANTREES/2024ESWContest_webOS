import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { Pie } from 'react-chartjs-2'; // Pie chart 추가
import 'chart.js/auto'; // Chart.js 자동 로드
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 데이터 레이블 플러그인 추가
import { Chart } from 'chart.js'; // Chart.js 로드
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
            size: 16, // 범례 글씨 크기
          },
        },
      },
      title: {
        display: true,
        text: '딸기 상태 비율',
        font: {
          size: 24, // 제목 글씨 크기
        },
      },
      datalabels: {
        formatter: (value) => `${value}%`, // 각 섹션 안에 비율 표시
        color: '#fff', // 레이블 색상
        font: {
          size: 20, // 레이블 글씨 크기
          weight: 'bold', // 글씨 굵기
        },
        display: true, // 항상 레이블 표시
        anchor: 'center', // 레이블을 중앙에 표시
        align: 'center', // 레이블을 섹션 안에 맞춤
      },
    },
  };

  // ON 메시지 전송 함수
  const handleSendMessageOn = () => {
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

  // OFF 메시지 전송 함수
  const handleSendMessageOff = () => {
    if (client) {
      client.publish('robot/location', 'OFF', (err) => {
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
          <div style={{ height: '500px', width: '500px' }}>
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

        {/* 버튼을 가로로 나열 */}
        <div className={css.buttonContainer}>
          {/* ON 메시지 전송 버튼 */}
          <button className={css.SendButton} onClick={handleSendMessageOn}>
            ON
          </button>
          {/* OFF 메시지 전송 버튼 */}
          <button className={css.SendButton} onClick={handleSendMessageOff}>
            OFF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PestManagement;