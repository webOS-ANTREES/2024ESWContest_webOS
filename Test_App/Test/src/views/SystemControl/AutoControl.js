import { useEffect, useState } from 'react';
import css from './AutoControl.module.css';
import { sendToast } from '../webOS_service/luna_service';

const AutoControl = ({ currentSensorData, client }) => {
  const [userInput, setUserInput] = useState({
    temperature: 10,
    humidity: 10,
    co2: 10,
    illumination: 1000 // illumination 변수를 초기값으로 설정
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleAutoControl = () => {
    const userTemperature = userInput.temperature;
    const userHumidity = userInput.humidity;
    const userCO2 = userInput.co2;
    const userIllumination = userInput.illumination; // illumination 변수 추가

    if (currentSensorData) {
      const { temperature, humidity, co2, illumination } = currentSensorData;

      // 조건을 만족하면 ON 메시지를 보냄
      if (temperature >= userTemperature || 
          humidity >= userHumidity || 
          co2 >= userCO2 || 
          illumination >= userIllumination) {
        if (client) {
          client.publish('nodemcu/stepper', 'ON');  // 모터 ON 메시지
          sendToast("천창이 열렸습니다!!")
        }
      } else {
        if (client) {
          client.publish('nodemcu/stepper', 'OFF');  // 모터 OFF 메시지
          sendToast("천창이 닫혔습니다!!")
        }
      }
    }
  };

  const handleConfirm = () => {
    // 확인 버튼을 클릭했을 때 입력값을 저장
    setUserInput((prevInput) => ({
      ...prevInput,
      temperature: userInput.temperature,
      humidity: userInput.humidity,
      co2: userInput.co2,
      illumination: userInput.illumination
    }));
  };

  const handleResetToDefault = () => {
    setUserInput({
      temperature: 10,
      humidity: 10,
      co2: 10,
      illumination: 1000
    });
  };

  return (
    <div className={`${css.SystemControlItem} ${css.SkylightControl}`}>
      <h2>천창 제어</h2>
      <div className={css.AutoControl}>
        <h3>자동 제어</h3>
        <div className={css.InputGrid}>

          {/* 온도 입력 필드 */}
          <div className={css.InputGroup}>
            <label>온도:</label>
            <div className={css.InputWithUnit}>
              <input
                type="number"
                name="temperature"
                className={css.InputField}
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
                value={userInput.illumination}
                onChange={handleInputChange}
              />
              <span className={css.Unit}>lux</span>
            </div>
          </div>
        </div>

        <button className={css.ControlButton} onClick={() => { handleAutoControl(); handleConfirm(); }}>
          확인
        </button>

        <button className={css.ControlButton} onClick={handleResetToDefault}>
          기본값
        </button>
      </div>
    </div>
  );
};

export default AutoControl;
