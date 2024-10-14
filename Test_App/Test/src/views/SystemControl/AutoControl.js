import { useState, useEffect } from 'react';
import { sendToast, saveSettingsToDB, getSettingsFromDB, deleteSettingsFromDB } from '../webOS_service/luna_service';
import css from './AutoControl.module.css';

const AutoControl = ({ currentSensorData, client }) => {
  // 기본 설정값 (천창, 내벽 천장, 내벽 사이드)
  const defaultSettings = {
    skylight: { temperature: 10, humidity: 10, co2: 10, illumination: 1000 },
    ceiling: { temperature: 10, humidity: 10, co2: 10, illumination: 1000 },
    sideWall: { temperature: 10, humidity: 10, co2: 10, illumination: 1000 },
  };

  const [userInput, setUserInput] = useState(defaultSettings); // 설정값 상태 관리
  const [loadedSettings, setLoadedSettings] = useState({
    skylight: null,
    ceiling: null,
    sideWall: null,
  });  // 불러온 설정값 저장

  // 설정값을 DB에서 불러오는 함수
  const loadSettings = (type) => {
    console.log(`Attempting to load ${type} settings from DB...`);  // 타입별 로그 확인
    getSettingsFromDB(type, (error, latestSettings) => {
      if (error) {
        console.log(`Error loading ${type} settings from DB:`, error);
      } else if (latestSettings) {
        console.log(`Latest ${type} settings from DB:`, JSON.stringify(latestSettings));

        // 최신 설정값을 상태로 반영 (불러온 값을 저장하는 부분 확인)
        setUserInput((prevInput) => ({
          ...prevInput,
          [type]: {
            ...prevInput[type], // 기존 설정값 유지
            ...latestSettings, // 새 설정값 덮어쓰기
          },
        }));

        setLoadedSettings((prevLoaded) => ({
          ...prevLoaded,
          [type]: {
            ...prevLoaded[type], // 기존 값 유지
            ...latestSettings, // 새 값 덮어쓰기
          },
        }));
        console.log(`${type} settings updated in state.`);
      } else {
        console.log(`No settings found for ${type} in DB.`);
      }
    });
  };

  useEffect(() => {
    setTimeout(() => loadSettings('skylight'), 100);
    setTimeout(() => loadSettings('ceiling'), 200);
    setTimeout(() => loadSettings('sideWall'), 300);
  }, []);

  useEffect(() => {
    if (loadedSettings.skylight) {
      console.log("Skylight settings loaded and updated:", JSON.stringify(loadedSettings.skylight));
    }
    if (loadedSettings.ceiling) {
      console.log("Ceiling settings loaded and updated:", JSON.stringify(loadedSettings.ceiling));
    }
    if (loadedSettings.sideWall) {
      console.log("SideWall settings loaded and updated:", JSON.stringify(loadedSettings.sideWall));
    }
  }, [loadedSettings]); // loadedSettings 상태가 변경될 때마다 실행

  // 입력값이 변경될 때 실행
  const handleInputChange = (type, e) => {
    const { name, value } = e.target;
    setUserInput((prevInput) => ({
      ...prevInput,
      [type]: {
        ...prevInput[type],
        [name]: parseInt(value) || 0,
      },
    }));
  };

  // 자동 제어 로직
  const handleAutoControl = (type) => {
    const controlSettings = userInput[type];
    if (currentSensorData) {
      const { temperature, humidity, co2, illumination } = currentSensorData;

      // 천창 제어 (MQTT topic: 'sky')
      if (type === 'skylight') {
        if (temperature >= controlSettings.temperature) {
          client.publish('nodemcu/sky', 'ON');
          sendToast("천창이 자동으로 열렸습니다.");
        } else {
          client.publish('nodemcu/sky', 'OFF');
          sendToast("천창이 자동으로 닫혔습니다.");
        }
      }
      // 내벽 천장 제어 (MQTT topic: 'ceiling')
      if (type === 'ceiling') {
        if (illumination >= controlSettings.illumination) {
          client.publish('nodemcu/ceiling', 'ON');
          sendToast("내벽 천장이 자동으로 열렸습니다.");
        } else {
          client.publish('nodemcu/ceiling', 'OFF');
          sendToast("내벽 천장이 자동으로 닫혔습니다.");
        }
      }
      // 내벽 사이드 제어 (MQTT topic: 'side')
      if (type === 'sideWall') {
        if (co2 >= controlSettings.co2 || humidity >= controlSettings.humidity) {
          client.publish('nodemcu/side', 'ON');
          sendToast("내벽이  자동으로 열렸습니다.");
        } else {
          client.publish('nodemcu/side', 'OFF');
          sendToast("내벽이 자동으로 닫혔습니다.");
        }
      }
    }
  };

  // 설정값을 확인하고 DB에 저장한 후, 자동 제어 함수 실행
  const handleConfirm = (type) => {
    const settings = userInput[type];
    console.log(`Saving settings for ${type}:`, settings);
    saveSettingsToDB(type, settings); // 설정값을 DB에 저장

    let typeName = '';
    switch (type) {
      case 'skylight':
        typeName = '천창';
        break;
      case 'ceiling':
        typeName = '내벽 천장';
        break;
      case 'sideWall':
        typeName = '내벽';
        break;
      default:
        typeName = type;
    }
    sendToast(`${typeName}의 제어 조건을 변경하였습니다. 온도: ${settings.temperature}°C, 습도: ${settings.humidity}%, CO2: ${settings.co2}ppm, 조도: ${settings.illumination}lux`);
    handleAutoControl(type);
  };

  // 설정을 기본값으로 되돌리는 함수
  const handleResetToDefault = (type) => {
    setUserInput((prevInput) => ({
      ...prevInput,
      [type]: defaultSettings[type],
    }));
    deleteSettingsFromDB(type); // DB에서 설정값 삭제
  };

  return (
    <div className={css.SystemControlContainer}>
      {/* 천창 제어 UI */}
      <div className={css.SystemControlItem}>
        <h2>천창 자동 제어</h2>
        <div className={css.InputGrid}>
          <div className={css.InputGroup}>
            <label>온도:</label>
            <input
              type="number"
              name="temperature"
              className={css.InputField}
              value={userInput.skylight.temperature}
              onChange={(e) => handleInputChange('skylight', e)}
            />
            <span className={css.Unit}>°C</span>
          </div>
          <div className={css.InputGroup}>
            <label>습도:</label>
            <input
              type="number"
              name="humidity"
              className={css.InputField}
              value={userInput.skylight.humidity}
              onChange={(e) => handleInputChange('skylight', e)}
            />
            <span className={css.Unit}>%</span>
          </div>
          <div className={css.InputGroup}>
            <label>CO2:</label>
            <input
              type="number"
              name="co2"
              className={css.InputField}
              value={userInput.skylight.co2}
              onChange={(e) => handleInputChange('skylight', e)}
            />
            <span className={css.Unit}>ppm</span>
          </div>
          <div className={css.InputGroup}>
            <label>조도:</label>
            <input
              type="number"
              name="illumination"
              className={css.InputField}
              value={userInput.skylight.illumination}
              onChange={(e) => handleInputChange('skylight', e)}
            />
            <span className={css.Unit}>lux</span>
          </div>
        </div>
        <button className={css.ControlButton} onClick={() => handleConfirm('skylight')}>
          확인
        </button>
        <button className={css.ControlButton} onClick={() => handleResetToDefault('skylight')}>
          기본값
        </button>
      </div>
      {/* 내벽 천장 제어 UI */}
      <div className={css.SystemControlItem}>
        <h2>내벽 천장 자동 제어</h2>
        <div className={css.InputGrid}>
          <div className={css.InputGroup}>
            <label>온도:</label>
            <input
              type="number"
              name="temperature"
              className={css.InputField}
              value={userInput.ceiling.temperature}
              onChange={(e) => handleInputChange('ceiling', e)}
            />
            <span className={css.Unit}>°C</span>
          </div>
          <div className={css.InputGroup}>
            <label>습도:</label>
            <input
              type="number"
              name="humidity"
              className={css.InputField}
              value={userInput.ceiling.humidity}
              onChange={(e) => handleInputChange('ceiling', e)}
            />
            <span className={css.Unit}>%</span>
          </div>
          <div className={css.InputGroup}>
            <label>CO2:</label>
            <input
              type="number"
              name="co2"
              className={css.InputField}
              value={userInput.ceiling.co2}
              onChange={(e) => handleInputChange('ceiling', e)}
            />
            <span className={css.Unit}>ppm</span>
          </div>
          <div className={css.InputGroup}>
            <label>조도:</label>
            <input
              type="number"
              name="illumination"
              className={css.InputField}
              value={userInput.ceiling.illumination}
              onChange={(e) => handleInputChange('ceiling', e)}
            />
            <span className={css.Unit}>lux</span>
          </div>
        </div>
        <button className={css.ControlButton} onClick={() => handleConfirm('ceiling')}>
          확인
        </button>
        <button className={css.ControlButton} onClick={() => handleResetToDefault('ceiling')}>
          기본값
        </button>
      </div>
      {/* 내벽 제어 UI */}
      <div className={css.SystemControlItem}>
        <h2>내벽 자동 제어</h2>
        <div className={css.InputGrid}>
          <div className={css.InputGroup}>
            <label>온도:</label>
            <input
              type="number"
              name="temperature"
              className={css.InputField}
              value={userInput.sideWall.temperature}
              onChange={(e) => handleInputChange('sideWall', e)}
            />
            <span className={css.Unit}>°C</span>
          </div>
          <div className={css.InputGroup}>
            <label>습도:</label>
            <input
              type="number"
              name="humidity"
              className={css.InputField}
              value={userInput.sideWall.humidity}
              onChange={(e) => handleInputChange('sideWall', e)}
            />
            <span className={css.Unit}>%</span>
          </div>
          <div className={css.InputGroup}>
            <label>CO2:</label>
            <input
              type="number"
              name="co2"
              className={css.InputField}
              value={userInput.sideWall.co2}
              onChange={(e) => handleInputChange('sideWall', e)}
            />
            <span className={css.Unit}>ppm</span>
          </div>
          <div className={css.InputGroup}>
            <label>조도:</label>
            <input
              type="number"
              name="illumination"
              className={css.InputField}
              value={userInput.sideWall.illumination}
              onChange={(e) => handleInputChange('sideWall', e)}
            />
            <span className={css.Unit}>lux</span>
          </div>
        </div>
        <button className={css.ControlButton} onClick={() => handleConfirm('sideWall')}>
          확인
        </button>
        <button className={css.ControlButton} onClick={() => handleResetToDefault('sideWall')}>
          기본값
        </button>
      </div>
    </div>
  );
};

export default AutoControl;