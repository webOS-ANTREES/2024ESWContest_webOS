import React, { useState, useEffect } from 'react';
import Button from '@enact/moonstone/Button';
import css from './Monitoring.module.less';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as weatherService from './Weather_Service';

const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

const MainPanel = () => {
    const [weather, setWeather] = useState({ seoul: {}, daegu: {}, busan: {} });
    const [selectedCity, setSelectedCity] = useState('daegu'); // 기본 선택된 도시는 대구
    const [detailedWeather, setDetailedWeather] = useState({ today: [], tomorrow: [], dayAfterTomorrow: [] });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDetailedWeather, setShowDetailedWeather] = useState(false);

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // 1초마다 시간 변경

        const apiInterval = setInterval(() => {
            weatherService.fetchDetailedWeather(selectedCity, apiKey, setDetailedWeather, setWeather, currentTime);
        }, 300000); // 5분마다 API 요청

        weatherService.fetchDetailedWeather(selectedCity, apiKey, setDetailedWeather, setWeather, currentTime); // 처음에 한 번 호출

        return () => {
            clearInterval(timeInterval);
            clearInterval(apiInterval);
        };
    }, [selectedCity]);

    return (
        <div className={css.container}>
            <h1 className={css.title}>날씨 정보</h1>
            <div className={css.currentTime}>
                <div>{weatherService.formatDateOnly(weatherService.getCurrentDate())}</div>
                <div>{currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className={css.infoContainer}>
                <div className={css.leftContainer}>
                    <Button
                        className={css.button}
                        onClick={() => setShowDetailedWeather(!showDetailedWeather)} // 클릭 시 세부 데이터 표시/숨김
                    >
                        <div className={css.cityName}>{weatherService.cities[selectedCity].name}</div>
                        <div className={css.temperature}>{weather[selectedCity]?.temperature}°C</div>
                        <div className={css.humidity}>{weather[selectedCity]?.humidity}%</div>
                        <div className={css.windSpeed}>{weather[selectedCity]?.windSpeed} m/s</div>
                        <div className={css.description}>{weather[selectedCity]?.description}</div>
                    </Button>
                </div>

                <div className={css.rightContainer}>
                    <div className={css.chartContainer}>
                        <h3>온도 그래프</h3>
                        <ResponsiveContainer width={300} height={200}>
                            <LineChart
                                data={detailedWeather.today.map(item => ({
                                    time: weatherService.formatTimeOnly(item.time),
                                    온도: item.temperature
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
                                    domain={[18, 40]}
                                    ticks={[18, 24, 30, 36, 40]}
                                    tick={{ fontSize: 14 }}
                                    interval={0}
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="온도"
                                    stroke="#FF5733"
                                    strokeWidth={3}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={css.chartContainer}>
                        <h3>습도 그래프</h3>
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
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="습도"
                                    stroke="#87CEEB"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {showDetailedWeather && (
                <div className={css.weatherContainer}>
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
    );
};

export default MainPanel;
