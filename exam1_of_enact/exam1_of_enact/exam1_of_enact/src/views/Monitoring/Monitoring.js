import React, { useEffect, useState } from 'react';
import axios from 'axios';
import css from './Monitoring.module.css';

const Monitoring = () => {
  const [weatherData, setWeatherData] = useState({ temperature: '', humidity: '' });
  const [sensorData, setSensorData] = useState({ temperature: '', humidity: '', airQuality: '', light: '' });
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  /* useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/weather'); // 서버의 변경된 포트 번호 사용
        const latestData = response.data[0]; // 최신 데이터를 사용
        setWeatherData({
          temperature: latestData.temperature,
          humidity: latestData.relativeHumidity
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/sensor');
        setSensorData(response.data);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensorData();
  }, []); */

  /*위 부분 하나의 함수로 업데이트*/ 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // 데이터 요청 시작 전 로딩 상태로 설정

        // weather data fetching
        const weatherResponse = await axios.get('http://localhost:5001/weather');
        const latestWeatherData = weatherResponse.data[0]; // 최신 데이터를 사용
        setWeatherData({
          temperature: latestWeatherData.temperature,
          humidity: latestWeatherData.relativeHumidity
        });

        // sensor data fetching
        const sensorResponse = await axios.get('http://localhost:5001/sensor');
        setSensorData(sensorResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // 데이터 요청 완료 후 로딩 상태 해제
      }
    };

    fetchData();
  }, []);

   // 로딩 중일 때 표시할 내용 추가
   if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className={css.monitoringContainer}>
      <div className={css.logData}>
        <h2>Log Data</h2>
        <ul>
          <li>2024-03-18</li>
          <li>2024-03-17</li>
          {/* 추가적인 로그 데이터 */}
        </ul>
      </div>
      <div className={css.dataDisplay}>
        <div className={css.graph}>
          <span>{weatherData.temperature}°C, {weatherData.humidity}%</span>
          {/* 그래프를 그리는 영역 */}
        </div>
        <div className={css.info}>
          <p>온도: {sensorData.temperature}°C</p>
          <p>습도: {sensorData.humidity}%</p>
          <p>대기질: {sensorData.airQuality}</p>
          <p>조도: {sensorData.light}</p>
          <p>작물상태</p>
          <p>병해충 잔여량(%)</p>
          <p>양액 관리</p>
          <p>(pH수준, 양액 온도)</p>
          <p>지양탱크 수위(%)</p>
          <p>병해충 감지</p>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
