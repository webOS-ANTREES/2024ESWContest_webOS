import { useState, useEffect } from 'react';
import { sendToast, saveSettingsToDB, getSettingsFromDB, deleteSettingsFromDB } from '../webOS_service/luna_service';
import css from './AutoControl.module.css';

const AutoControl = ({ currentSensorData, client }) => {
  // 기본 설정값
  const defaultSettings = {
    temperature: 10,
    humidity: 10,
    co2: 10,
    illumination: 1000
  };

  const [userInput, setUserInput] = useState(defaultSettings); // 설정값 상태 관리
  const [loadedSettings, setLoadedSettings] = useState(null);  // 불러온 설정값 저장

  // 설정값을 DB에서 불러오는 함수
  const loadSettings = () => {
    console.log("Loading settings from DB...");

    getSettingsFromDB((error, latestSettings) => {
      if (error) {
        console.log("Error loading settings from DB:", error);
      } else if (latestSettings) {
        console.log("Latest settings from DB:", JSON.stringify(latestSettings));

        // 최신 설정값을 상태로 반영
        setUserInput(latestSettings);
        setLoadedSettings(latestSettings); // 최신 설정값을 loadedSettings로 반영
      }
    });
  };

  // 컴포넌트 마운트 시 DB에서 설정값 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  // loadedSettings 상태가 변경되었을 때 로그 출력
  useEffect(() => {
    if (loadedSettings) {
      console.log("Loaded settings state has been updated:", JSON.stringify(loadedSettings));
    }
  }, [loadedSettings]); // loadedSettings 상태가 변경될 때마다 실행

  // 입력값이 변경될 때 실행
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newUserInput = {
      ...userInput,
      [name]: parseInt(value) || 0 // 입력값을 숫자로 변환 후 상태에 반영
    };
    setUserInput(newUserInput); // 상태 업데이트
  };

  // 자동 제어 로직
  const handleAutoControl = () => {
    const userTemperature = userInput.temperature;
    const userHumidity = userInput.humidity;
    const userCO2 = userInput.co2;
    const userIllumination = userInput.illumination;

    if (currentSensorData) {
      const { temperature, humidity, co2, illumination } = currentSensorData;

      if (temperature >= userTemperature ||
        humidity >= userHumidity ||
        co2 >= userCO2 ||
        illumination >= userIllumination) {
        if (client) {
          client.publish('nodemcu/stepper', 'ON'); // 모터 ON 메시지
          sendToast("천창이 열렸습니다.");
        }
      } else {
        if (client) {
          client.publish('nodemcu/stepper', 'OFF'); // 모터 OFF 메시지
          sendToast("천창이 닫혔습니다.");
        }
      }
    }
  };

  // 설정값을 확인하고 DB에 저장한 후, 자동 제어 함수 실행
  const handleConfirm = async () => {
    try {
      await saveSettingsToDB(userInput); //설정값을 DB에 저장 (비동기 처리)
      sendToast(`천장 자동 제어 조건이 변경되었습니다. 온도 ${userInput.temperature}°C, 습도 ${userInput.humidity}%, CO2 ${userInput.co2}ppm, 조도 ${userInput.illumination}lux`);
      handleAutoControl();
    } catch (error) {
      console.log("Error saving settings to DB:", error);
    }
  };

  // 설정을 기본값으로 되돌리는 함수
  const handleResetToDefault = () => {
    setUserInput(defaultSettings); // 기본값으로 상태 업데이트
    deleteSettingsFromDB(); // DB에서 설정값 삭제
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

        <button className={css.ControlButton} onClick={handleConfirm}>
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