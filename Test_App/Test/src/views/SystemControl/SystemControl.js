import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './SystemControl.module.css';
import { getDatabase, ref, query, limitToLast, onValue } from 'firebase/database';
import { firebaseApp } from '../../Firebase';

const SystemControl = () => {
  const [client, setClient] = useState(null);
  const [currentSensorData, setLatestSensorData] = useState(null);
  const [userInput, setUserInput] = useState({
    temperature: '',
    humidity: '',
    co2: '',
    illumination: ''
  });

  // 외벽 제어 상태를 추적하는 state
  const [isWallOpen, setIsWallOpen] = useState(false); // 처음에는 닫혀있다고 가정

  const DEFAULT_CONDITIONS = {
    temperature: 10,
    humidity: 10,
    co2: 10
  };

  useEffect(() => {
    // MQTT 및 Firebase 설정
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

  // 센서 데이터가 업데이트되면 자동 제어를 실행
  useEffect(() => {
    if (currentSensorData) {
      handleAutoControl();
    }
  }, [currentSensorData]);  // currentSensorData가 업데이트될 때 실행

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleAutoControl = () => {
    const userTemperature = userInput.temperature || DEFAULT_CONDITIONS.temperature;
    const userHumidity = userInput.humidity || DEFAULT_CONDITIONS.humidity;
    const userCO2 = userInput.co2 || DEFAULT_CONDITIONS.co2;

    if (currentSensorData) {
      const { temperature, humidity, co2 } = currentSensorData;

      // 조건을 만족하면 ON 메시지를 보냄 (한번만 전송)
      if (temperature >= userTemperature || humidity >= userHumidity || co2 >= userCO2) {
        if (!isWallOpen) {  // 현재 외벽이 닫혀 있으면
          handlePestControlClick();  // ON 메시지를 한번만 보냄
          setIsWallOpen(true);  // 외벽이 열렸음을 상태로 저장
        }
      } 
      // 조건을 만족하지 않으면 OFF 메시지를 보냄 (한번만 전송)
      else {
        if (isWallOpen) {  // 현재 외벽이 열려 있으면
          handleWallControlClick();  // OFF 메시지를 한번만 보냄
          setIsWallOpen(false);  // 외벽이 닫혔음을 상태로 저장
        }
      }
    }
  };

  const handleResetToDefault = () => {
    setUserInput({
      temperature: DEFAULT_CONDITIONS.temperature,
      humidity: DEFAULT_CONDITIONS.humidity,
      co2: DEFAULT_CONDITIONS.co2,
      illumination: ''
    });
  };

  const handlePestControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'ON');  // 외벽 제어 ON 메시지
    }
  };

  const handleWallControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'OFF');  // 외벽 제어 OFF 메시지
    }
  };

  return (
    <div className={css.SystemControlContainer}>
      <div className={`${css.SystemControlItem} ${css.SkylightControl}`}>
        <h2>천창제어</h2>
        <div className={css.AutoControl}>
          <h3>자동제어</h3>
          <div className={css.InputGrid}>
            {/* 온도 입력 필드 */}
            <div className={css.InputGroup}>
              <label>온도:</label>
              <div className={css.InputWithUnit}>
                <input
                  type="number"
                  name="temperature"
                  className={css.InputField}
                  placeholder={`${DEFAULT_CONDITIONS.temperature}`}
                  value={userInput.temperature}
                  onChange={handleInputChange}
                />
                <span className={css.Unit}>°C</span>
              </div>
            </div>

            {/* 습도 입력 필드 */}
            <div className={css.InputGroup}>
              <label>습도:</label>
              <div className={css.InputWithUnit}>
                <input
                  type="number"
                  name="humidity"
                  className={css.InputField}
                  placeholder={`${DEFAULT_CONDITIONS.humidity}`}
                  value={userInput.humidity}
                  onChange={handleInputChange}
                />
                <span className={css.Unit}>%</span>
              </div>
            </div>

            {/* CO2 입력 필드 */}
            <div className={css.InputGroup}>
              <label>CO2:</label>
              <div className={css.InputWithUnit}>
                <input
                  type="number"
                  name="co2"
                  className={css.InputField}
                  placeholder={`${DEFAULT_CONDITIONS.co2}`}
                  value={userInput.co2}
                  onChange={handleInputChange}
                />
                <span className={css.Unit}>ppm</span>
              </div>
            </div>

            {/* 조도 입력 필드 */}
            <div className={css.InputGroup}>
              <label>조도:</label>
              <div className={css.InputWithUnit}>
                <input
                  type="number"
                  name="illumination"
                  className={css.InputField}
                  placeholder="조도 입력"
                  value={userInput.illumination}
                  onChange={handleInputChange}
                />
                <span className={css.Unit}>lux</span>
              </div>
            </div>
          </div>

          {/* 확인 버튼 */}
          <button className={css.ControlButton} onClick={handleAutoControl}>
            확인
          </button>

          {/* 기본값으로 초기화 버튼 */}
          <button className={css.ControlButton} onClick={handleResetToDefault}>
            기본값
          </button>
        </div>
        <div className={css.ManualControl}>
          <h3>수동제어</h3>
          <div className={css.ControlButtonContainer}>
            <button className={css.ControlButton} onClick={handlePestControlClick}>
              열기
            </button>
            <button className={css.ControlButton} onClick={handleWallControlClick}>
              닫기
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
