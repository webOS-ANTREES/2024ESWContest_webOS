import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import css from './SystemControl.module.css';
import { getDatabase, ref, query, limitToLast, onValue } from 'firebase/database';
import { firebaseApp } from '../../Firebase';

const SystemControl = () => {
  const [client, setClient] = useState(null);
  const [latestSensorData, setLatestSensorData] = useState({
    temperature: '',
    humidity: '',
    co2: '',
    illumination: ''
  });

  const [userInput, setUserInput] = useState({
    temperature: '',
    humidity: '',
    co2: '',
    illumination: ''
  });

  const DEFAULT_CONDITIONS = {
    temperature: 20,
    humidity: 50,
    co2: 900
  };

  useEffect(() => {
    const mqttClient = mqtt.connect('ws://172.20.48.180:1884');
    setClient(mqttClient);

    const todayDate = new Date().toISOString().split('T')[0];
    const database = getDatabase(firebaseApp);
    const sensorDataRef = query(ref(database, `sensorData/${todayDate}`));

onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const latestKey = Object.keys(data)[0];
          const latestData = data[latestKey];
          console.log("최신 센서 데이터:", latestData);
          setLatestSensorData(latestData);
        } else {
          console.log("센서 데이터가 없습니다.");
        }
      });

    return () => {
      mqttClient.end();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const autoControl = (latestData) => {
    const { temperature, humidity, co2 } = latestData;

    const userTemperature = userInput.temperature || DEFAULT_CONDITIONS.temperature;
    const userHumidity = userInput.humidity || DEFAULT_CONDITIONS.humidity;
    const userCO2 = userInput.co2 || DEFAULT_CONDITIONS.co2;

    if (temperature >= userTemperature && humidity >= userHumidity && co2 >= userCO2) {
      handlePestControlClick();
    } else {
      handleWallControlClick();
    }
  };

  const handlePestControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'ON');
    }
  };

  const handleWallControlClick = () => {
    if (client) {
      client.publish('nodemcu/stepper', 'OFF');
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
              <input
                type="number"
                name="temperature"
                className={css.InputField}
                placeholder={`${DEFAULT_CONDITIONS.temperature}°C`}
                value={userInput.temperature || latestSensorData.temperature}
                onChange={handleInputChange}
              />
            </div>
            <div className={css.InputGroup}>
              <label>습도:</label>
              <input
                type="number"
                name="humidity"
                className={css.InputField}
                placeholder={`${DEFAULT_CONDITIONS.humidity}%`}
                value={userInput.humidity || latestSensorData.humidity}
                onChange={handleInputChange}
              />
            </div>
            <div className={css.InputGroup}>
              <label>CO2:</label>
              <input
                type="number"
                name="co2"
                className={css.InputField}
                placeholder={`${DEFAULT_CONDITIONS.co2}ppm`}
                value={userInput.co2 || latestSensorData.co2}
                onChange={handleInputChange}
              />
            </div>
            <div className={css.InputGroup}>
              <label>조도:</label>
              <input
                type="number"
                name="illumination"
                className={css.InputField}
                placeholder="조도 입력"
                value={userInput.illumination || latestSensorData.illumination}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* 최신 센서 데이터 사각형 */}
        <div className={css.LatestSensorData}>
          <h4>최신 센서 데이터</h4>
          <p>온도: {latestSensorData.temperature} °C</p>
          <p>습도: {latestSensorData.humidity} %</p>
          <p>CO2: {latestSensorData.co2} ppm</p>
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
