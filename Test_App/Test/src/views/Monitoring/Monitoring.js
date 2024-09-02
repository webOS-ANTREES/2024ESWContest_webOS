import React, { useState, useEffect } from 'react';
import Button from '@enact/moonstone/Button';
import css from './Monitoring.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as weatherService from './Weather_Service';
import { getDatabase, ref, onValue } from 'firebase/database';
import { firebaseApp } from '../../Firebase';

const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

const MainPanel = () => {
    const [weather, setWeather] = useState({ seoul: {}, daegu: {}, busan: {} });
    const [selectedCity, setSelectedCity] = useState('daegu');
    const [detailedWeather, setDetailedWeather] = useState({ today: [], tomorrow: [], dayAfterTomorrow: [] });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDetailedWeather, setShowDetailedWeather] = useState(false);
    const [sensorData, setSensorData] = useState([]);
    const [currentSensorData, setLatestSensorData] = useState(null);
    const [logData, setLogData] = useState({}); // 모든 로그 데이터를 저장
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const todayDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const apiInterval = setInterval(() => {
            weatherService.fetchDetailedWeather(selectedCity, apiKey, setDetailedWeather, setWeather, currentTime);
        }, 300000);

        weatherService.fetchDetailedWeather(selectedCity, apiKey, setDetailedWeather, setWeather, currentTime);

        const database = getDatabase(firebaseApp);
        const sensorDataRef = ref(database, `sensorData/${todayDate}`);
        const logDataRef = ref(database, 'sensorData'); // 전체 로그 데이터를 가져오기

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

                setSensorData(allData);
                const currentData = allData[allData.length - 1];
                setLatestSensorData(currentData);
            } else {
                setSensorData([]);
                setLatestSensorData(null);
            }
        });

        onValue(logDataRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLogData(data);
            } else {
                setLogData({});
            }
        });

        return () => {
            clearInterval(timeInterval);
            clearInterval(apiInterval);
        };
    }, [selectedCity]);

    // 추가된 부분
    const todaySensorData = sensorData; // 오늘 날짜의 데이터

    const handleDateClick = (date) => {
        setSelectedDate(date === selectedDate ? null : date);
        setSelectedTime(null);
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time === selectedTime ? null : time);
    };

    return (
        <div className={css.container}>
            <div className={css.logContainer}>
                <h3>Log Data</h3>
                {Object.keys(logData).map((date) => (
                    <div key={date}>
                        <div className={css.date} onClick={() => handleDateClick(date)}>
                            {date.replace("-", "년 ").replace("-", "월 ") + "일"}
                        </div>
                        {selectedDate === date &&
                            Object.keys(logData[date]).map((time) => (
                                <div key={time} className={css.time} onClick={() => handleTimeClick(time)}>
                                    {time.replace("-", "시 ").replace("-", "분 ") + "초"}
                                    {selectedTime === time &&
                                        Object.keys(logData[date][time]).map((key) => (
                                            <div key={key} className={css.sensorData}>
                                                <p>온도: {logData[date][time][key].temperature}°C</p>
                                                <p>습도: {logData[date][time][key].humidity}%</p>
                                                <p>CO2: {logData[date][time][key].co2}ppm</p>
                                            </div>
                                        ))}
                                </div>
                            ))}
                    </div>
                ))}
            </div>

            <div className={css.sensorContainer}>

                {/* 최신 센서 데이터 표시 */}
                {currentSensorData && (
                    <div className={css.currentSensorDataContainer}>
                        <h3>Current Sensor Data</h3>
                        <p>온도: {currentSensorData.temperature}°C</p>
                        <p>습도: {currentSensorData.humidity}%</p>
                        <p>CO2: {currentSensorData.co2}ppm</p>
                    </div>
                )}

                <div className={css.sensorChartContainer}>
                    <div className={css.chartContainer}>
                        <ResponsiveContainer width={300} height={200}>
                            <LineChart
                                data={todaySensorData.map(item => ({
                                    time: new Date(item.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),  // 시간 표시
                                    온도: item.temperature
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis
                                    stroke="#000000"
                                    domain={[20, 32]}
                                    ticks={[20, 23, 26, 29, 32]}
                                    tick={{ fontSize: 14 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="left" />
                                <Line
                                    type="monotone"
                                    dataKey="온도"
                                    stroke="#FF5733"
                                    strokeWidth={3}
                                    dot={false}  // 데이터 포인트의 동그라미 원 제거
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={css.chartContainer}>
                        <ResponsiveContainer width={300} height={200}>
                            <LineChart
                                data={todaySensorData.map(item => ({
                                    time: new Date(item.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),  // 시간 표시
                                    습도: item.humidity
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis
                                    stroke="#000000"
                                    domain={[0, 100]}
                                    ticks={[0, 25, 50, 75, 100]}
                                    tick={{ fontSize: 14 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="left" />
                                <Line
                                    type="monotone"
                                    dataKey="습도"
                                    stroke="#87CEEB"
                                    strokeWidth={3}
                                    dot={false}  // 데이터 포인트의 동그라미 원 제거
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={css.chartContainer}>
                        <ResponsiveContainer width={300} height={200}>
                            <LineChart
                                data={todaySensorData.map(item => ({
                                    time: new Date(item.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),  // 시간 표시
                                    Co2: item.co2
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis
                                    stroke="#000000"
                                    domain={[0, 2000]}
                                    ticks={[0, 500, 1000, 1500, 2000]}
                                    tick={{ fontSize: 14 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="left" />
                                <Line
                                    type="monotone"
                                    dataKey="Co2"
                                    stroke="#919191"
                                    strokeWidth={3}
                                    dot={false}  // 데이터 포인트의 동그라미 원 제거
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            <div className={css.weatherContainer}>

                <div className={css.currentTime}>
                    <div>{weatherService.formatDateOnly(weatherService.getCurrentDate())}</div>
                    <div>{currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className={css.weatherMain}>
                    <Button
                        className={css.weatherButton}
                        onClick={() => setShowDetailedWeather(!showDetailedWeather)}
                    >
                        <div className={css.cityName}>{weatherService.cities[selectedCity].name}</div>
                        <div className={css.temperature}>{weather[selectedCity]?.temperature}°C</div>
                        <div className={css.humidity}>{weather[selectedCity]?.humidity}%</div>
                        <div className={css.windSpeed}>{weather[selectedCity]?.windSpeed} m/s</div>
                        <div className={css.description}>{weather[selectedCity]?.description}</div>
                    </Button>

                    <div className={css.chartContainer}>
                        <ResponsiveContainer width={300} height={200}>
                            <LineChart
                                data={detailedWeather.today.map(item => ({
                                    time: weatherService.formatTimeOnly(item.time),
                                    온도: item.temperature
                                }))}
                                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    ticks={['00시', '06시', '12시', '18시']}
                                    tick={{ fontSize: 14, textAnchor: 'front' }}
                                />
                                <YAxis
                                    stroke="#000000"
                                    domain={[18, 40]}
                                    ticks={[18, 24, 30, 36, 40]}
                                    tick={{ fontSize: 14 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="left" />
                                <Line
                                    type="monotone"
                                    dataKey="온도"
                                    stroke="#FF5733"
                                    strokeWidth={3}
                                    dot={false}  // 데이터 포인트의 동그라미 원 제거
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={css.chartContainer}>
                        <ResponsiveContainer width={300} height={200}>
                            <LineChart
                                data={detailedWeather.today.map(item => ({
                                    time: weatherService.formatTimeOnly(item.time),
                                    습도: item.humidity
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    ticks={['00시', '06시', '12시', '18시']}
                                    tick={{ fontSize: 14, textAnchor: 'front' }}
                                />
                                <YAxis
                                    stroke="#000000"
                                    domain={[0, 100]}
                                    ticks={[0, 25, 50, 75, 100]}
                                    tick={{ fontSize: 14 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="left" />
                                <Line
                                    type="monotone"
                                    dataKey="습도"
                                    stroke="#87CEEB"
                                    strokeWidth={3}
                                    dot={false}  // 데이터 포인트의 동그라미 원 제거
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {showDetailedWeather && (
                    <div className={css.detailweatherContainer}>
                        <h3>세부 날씨</h3>
                        <h4>{weatherService.formatDateOnly(weatherService.getCurrentDate())}</h4>
                        <table className={css.weatherTable}>
                            <thead>
                                <tr>
                                    <th>시각</th>
                                    <th>날씨</th>
                                    <th>기온</th>
                                    <th>강수량</th>
                                    <th>강수확률</th>
                                    <th>풍속</th>
                                    <th>습도</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedWeather.today.map((item, index) => (
                                    <tr key={index}>
                                        <td>{weatherService.formatTimeOnly(item.time)}</td>
                                        <td>{weatherService.getSkyDescription(item.sky)}</td>
                                        <td>{item.temperature}°C</td>
                                        <td>{item.precipitation}</td>
                                        <td>{item.precipitationProbability}%</td>
                                        <td>{item.windSpeed} m/s</td>
                                        <td>{item.humidity}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4>{weatherService.formatDateOnly(weatherService.getTomorrowDate())}</h4>
                        <table className={css.weatherTable}>
                            <thead>
                                <tr>
                                    <th>시각</th>
                                    <th>날씨</th>
                                    <th>기온</th>
                                    <th>강수량</th>
                                    <th>강수확률</th>
                                    <th>풍속</th>
                                    <th>습도</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedWeather.tomorrow.map((item, index) => (
                                    <tr key={index}>
                                        <td>{weatherService.formatTimeOnly(item.time)}</td>
                                        <td>{weatherService.getSkyDescription(item.sky)}</td>
                                        <td>{item.temperature}°C</td>
                                        <td>{item.precipitation}</td>
                                        <td>{item.precipitationProbability}%</td>
                                        <td>{item.windSpeed} m/s</td>
                                        <td>{item.humidity}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4>{weatherService.formatDateOnly(weatherService.getDayAfterTomorrowDate())}</h4>
                        <table className={css.weatherTable}>
                            <thead>
                                <tr>
                                    <th>시각</th>
                                    <th>날씨</th>
                                    <th>기온</th>
                                    <th>강수량</th>
                                    <th>강수확률</th>
                                    <th>풍속</th>
                                    <th>습도</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedWeather.dayAfterTomorrow.map((item, index) => (
                                    <tr key={index}>
                                        <td>{weatherService.formatTimeOnly(item.time)}</td>
                                        <td>{weatherService.getSkyDescription(item.sky)}</td>
                                        <td>{item.temperature}°C</td>
                                        <td>{item.precipitation}</td>
                                        <td>{item.precipitationProbability}%</td>
                                        <td>{item.windSpeed} m/s</td>
                                        <td>{item.humidity}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


        </div>
    );
};

export default MainPanel;