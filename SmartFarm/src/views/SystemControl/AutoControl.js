import { useState, useEffect } from 'react';
import { ref, query, onValue, limitToLast } from "firebase/database";  // Firebase 관련 모듈 추가
import { database } from '../Firebase/Firebase';  // Firebase 설정 파일에서 DB 불러오기
import { sendToast, saveSettingsToDB, getSettingsFromDB, deleteSettingsFromDB } from '../webOS_service/luna_service';
import css from './AutoControl.module.css';

const AutoControl = ({ client }) => {
  // 기본 설정값 (천창, 내벽 천장, 내벽 사이드)
  const defaultSettings = {
    skylight: { temperature: 20, humidity: 60, co2: 900, illuminance: 2500 },
    ceiling: { temperature: 20, humidity: 60, co2: 900, illuminance: 2500 },
    sideWall: { temperature: 20, humidity: 60, co2: 900, illuminance: 2500 },
  };

  const [userInput, setUserInput] = useState(defaultSettings); // 설정값 상태 관리
  const [loadedSettings, setLoadedSettings] = useState({
    skylight: null,
    ceiling: null,
    sideWall: null,
  });
  const [latestSensorData, setLatestSensorData] = useState(null);

  // Firebase에서 최신 센서 데이터를 불러오는 함수
  const loadLatestSensorData = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const sensorDataRef = query(ref(database, `sensorData/${todayDate}`), limitToLast(1)); // 오늘 날짜의 데이터에서 최신 값 추출

    onValue(sensorDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allData = [];
        // 외부 타임스탬프 키(timeKey) 및 내부 데이터 키(innerKey)를 순회하며 데이터를 배열에 쌓음
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

        // 가장 최신 데이터를 배열의 마지막에서 가져옴
        const currentData = allData[allData.length - 1];
        setLatestSensorData(currentData); // 최신 센서 데이터를 상태로 설정
      } else {
        setLatestSensorData(null);
      }
    });
  };

  // 설정값을 DB에서 불러오는 함수
  const loadSettings = (type) => {
    console.log(`Attempting to load ${type} settings from DB...`);
    getSettingsFromDB(type, (error, latestSettings) => {
      if (error) {
        console.log(`Error loading ${type} settings from DB:`, error);
      } else if (latestSettings) {
        console.log(`Latest ${type} settings from DB:`, JSON.stringify(latestSettings));

        // 최신 설정값을 상태로 반영
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

  // 모든 설정을 불러오는 함수
  useEffect(() => {
    const loadAllSettings = () => {
      loadSettings('skylight');
      setTimeout(() => loadSettings('ceiling'), 200);
      setTimeout(() => loadSettings('sideWall'), 300);
    };

    loadAllSettings();
    loadLatestSensorData(); // 센서 데이터도 불러옴
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
        [name]: value === "" ? "" : parseInt(value, 10),
      },
    }));
  };

  // 자동 제어 로직
  const handleAutoControl = (type) => {
    const controlSettings = userInput[type];

    if (latestSensorData) {
      const temperature = Number(latestSensorData.temperature);
      const humidity = Number(latestSensorData.humidity);
      const co2 = Number(latestSensorData.co2);
      const illuminance = Number(latestSensorData.illuminance);

      const tempSetting = Number(controlSettings.temperature);
      const humiditySetting = Number(controlSettings.humidity);
      const co2Setting = Number(controlSettings.co2);
      const illuminanceSetting = Number(controlSettings.illuminance);

      // 천창 제어
      if (type === 'skylight') {
        if (temperature >= tempSetting && humidity >= humiditySetting && co2 >= co2Setting && illuminance >= illuminanceSetting) {
          client.publish('nodemcu/sky', 'ON');
          setTimeout(() => {
            sendToast("천창이 자동으로 열렸습니다.");
          }, 1000);
        } else {
          console.log("Skylight: Closing");
          client.publish('nodemcu/sky', 'OFF');
          setTimeout(() => {
            sendToast("천창이 자동으로 닫혔습니다.");
          }, 1000);
        }
      }

      // 내벽 천장 제어
      if (type === 'ceiling') {
        if (temperature >= tempSetting && humidity >= humiditySetting && co2 >= co2Setting && illuminance >= illuminanceSetting) {
          client.publish('nodemcu/ceiling', 'OFF');
          setTimeout(() => {
            sendToast("내벽 천장이 자동으로 열렸습니다.");
          }, 3000);
        } else {
          client.publish('nodemcu/ceiling', 'ON');
          setTimeout(() => {
            sendToast("내벽 천장이 자동으로 닫혔습니다.");
          }, 3000);
        }
      }

      // 내벽 제어
      if (type === 'sideWall') {
        if (temperature >= tempSetting && humidity >= humiditySetting && co2 >= co2Setting && illuminance >= illuminanceSetting) {
          client.publish('nodemcu/side_left', 'OFF');
          client.publish('nodemcu/side_right', 'ON');
          setTimeout(() => {
            sendToast("내벽이 자동으로 열렸습니다.");
          }, 3000);
        } else {
          client.publish('nodemcu/side_left', 'ON');
          client.publish('nodemcu/side_right', 'OFF');
          setTimeout(() => {
            sendToast("내벽이 자동으로 닫혔습니다.");
          }, 3000);
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
    sendToast(`${typeName}의 제어 조건을 변경하였습니다. 온도: ${settings.temperature}°C, 습도: ${settings.humidity}%, CO2: ${settings.co2}ppm, 조도: ${settings.illuminance}lux`);
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
              name="illuminance"
              className={css.InputField}
              value={userInput.skylight.illuminance}
              onChange={(e) => handleInputChange('skylight', e)}
            />
            <span className={css.Unit}>lux</span>
          </div>
        </div>
        <button className={css.ControlButton} onClick={() => handleConfirm('skylight')}>
          확인
        </button>
        <button className={css.ControlButton} onClick={() => handleResetToDefault('skylight')}>
          기본 설정
        </button>
      </div>
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
              name="illuminance"
              className={css.InputField}
              value={userInput.ceiling.illuminance}
              onChange={(e) => handleInputChange('ceiling', e)}
            />
            <span className={css.Unit}>lux</span>
          </div>
        </div>
        <button className={css.ControlButton} onClick={() => handleConfirm('ceiling')}>
          확인
        </button>
        <button className={css.ControlButton} onClick={() => handleResetToDefault('ceiling')}>
          기본 설정
        </button>
      </div>
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
              name="illuminance"
              className={css.InputField}
              value={userInput.sideWall.illuminance}
              onChange={(e) => handleInputChange('sideWall', e)}
            />
            <span className={css.Unit}>lux</span>
          </div>
        </div>
        <button className={css.ControlButton} onClick={() => handleConfirm('sideWall')}>
          확인
        </button>
        <button className={css.ControlButton} onClick={() => handleResetToDefault('sideWall')}>
          기본 설정
        </button>
      </div>
    </div>
  );
};

export default AutoControl;