import React, { useState, useEffect } from 'react';
import Button from '@enact/moonstone/Button';
import css from './Monitoring.module.less';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const apiKey = 'REfIOnBRgqpcfkxwP4nMVXcFwgQ%2FMu5JyjMkyl3OSsXrPclbv6boTzEVXmn%2Fv2f81V6pW0p4seWEn2gl%2F2f7xw%3D%3D';

const MainPanel = () => {
    const [weather, setWeather] = useState({ seoul: {}, daegu: {}, busan: {} });
    const [selectedCity, setSelectedCity] = useState('daegu'); // 대구를 기본 선택
    const [detailedWeather, setDetailedWeather] = useState({ today: [], tomorrow: [], dayAfterTomorrow: [] });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showDetailedWeather, setShowDetailedWeather] = useState(false); // 세부 날씨 데이터 표시 상태

    const cities = {
        seoul: { name: '서울', nx: 60, ny: 127 },
        daegu: { name: '대구', nx: 89, ny: 90 },
        busan: { name: '부산', nx: 97, ny: 74 }
    };

    const fetchDetailedWeather = async (city) => {
        const { nx, ny } = cities[city];
        const response = await fetch(`http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&numOfRows=1000&pageNo=1&base_date=${getPreviousDate()}&base_time=2300&dataType=JSON&nx=${nx}&ny=${ny}`);
        const data = await response.json();

        if (data.response.header.resultCode === '00') {
            const items = data.response.body.items.item;
            const detailedWeather = items.filter(item => ['TMP', 'REH', 'POP', 'PCP', 'WSD', 'SKY', 'PTY'].includes(item.category)).map(item => ({
                date: item.fcstDate,
                time: item.fcstTime,
                temperature: item.category === 'TMP' ? item.fcstValue : null,
                humidity: item.category === 'REH' ? item.fcstValue : null,
                precipitationProbability: item.category === 'POP' ? item.fcstValue : null,
                precipitation: item.category === 'PCP' ? item.fcstValue : null,
                windSpeed: item.category === 'WSD' ? item.fcstValue : null,
                sky: item.category === 'SKY' ? item.fcstValue : null,
                pty: item.category === 'PTY' ? item.fcstValue : null
            })).reduce((acc, item) => {
                const existing = acc.find(i => i.date === item.date && i.time === item.time);
                if (existing) {
                    Object.keys(item).forEach(key => {
                        if (item[key] !== null) existing[key] = item[key];
                    });
                } else {
                    acc.push(item);
                }
                return acc;
            }, []);
            // 강수확률이 0%일 때 강수량을 '강수없음'으로 설정

            detailedWeather.forEach(item => {
                if (item.precipitationProbability === '0' || item.precipitationProbability === null) {
                    item.precipitation = '강수없음';
                } else {
                    item.precipitation = formatPrecipitation(item.precipitation);
                }
            });

            detailedWeather.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

            const today = getCurrentDate();
            const tomorrow = getTomorrowDate();
            const dayAfterTomorrow = getDayAfterTomorrowDate();

            setDetailedWeather({
                today: detailedWeather.filter(item => item.date === today),
                tomorrow: detailedWeather.filter(item => item.date === tomorrow),
                dayAfterTomorrow: detailedWeather.filter(item => item.date === dayAfterTomorrow)
            });

            // 현재 시각에 가장 가까운 데이터를 사용하여 현재 날씨 설정
            const closestWeather = getClosestWeather(detailedWeather, currentTime);
            setWeather(prevWeather => ({
                ...prevWeather,
                [city]: {
                    temperature: closestWeather.temperature,
                    description: getSkyDescription(closestWeather.sky, closestWeather.pty),
                    humidity: closestWeather.humidity,
                    windSpeed: closestWeather.windSpeed
                }
            }));
        }
    };

    const getClosestWeather = (weatherData, currentTime) => {
        return weatherData.reduce((closest, item) => {
            const itemTime = new Date(`${item.date.substring(0, 4)}-${item.date.substring(4, 6)}-${item.date.substring(6, 8)}T${item.time.substring(0, 2)}:00`);
            const closestTime = new Date(`${closest.date.substring(0, 4)}-${closest.date.substring(4, 6)}-${closest.date.substring(6, 8)}T${closest.time.substring(0, 2)}:00`);
            return Math.abs(currentTime - itemTime) < Math.abs(currentTime - closestTime) ? item : closest;
        });
    };

    const getCurrentDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const getPreviousDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1); // 어제 날짜로 설정
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const getTomorrowDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const getDayAfterTomorrowDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const getSkyDescription = (sky) => {
        if (sky !== '0') {
            switch (sky) {
                case '1': return '맑음';
                case '3': return '구름 많음';
                case '4': return '흐림';
                default: return '';
            }
        } 
    };

    const formatDateOnly = (date) => {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      return `${year}년 ${month}월 ${day}일`;
    };
  
    const formatTimeOnly = (time) => {
      const hour = String(parseInt(time.substring(0, 2))).padStart(2, '0');
      return `${hour}시`;
    };

    const formatPrecipitation = (precipitation) => {
        if (!precipitation || precipitation === '-' || precipitation === '강수없음') {
            return '강수없음';
        }
        const f = parseFloat(precipitation);
        if (f < 1.0) return "1.0mm 미만";
        else if (f >= 1.0 && f < 30.0) return `${f.toFixed(1)}mm`;
        else if (f >= 30.0 && f < 50.0) return "30.0~50.0mm";
        else return "50.0mm 이상";
    };

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // 1초마다 시간 변경
    
        const apiInterval = setInterval(() => {
            fetchDetailedWeather(selectedCity);
        }, 300000); // 5분마다 API 요청
    
        fetchDetailedWeather(selectedCity); // 처음에 한 번 호출
    
        return () => {
            clearInterval(timeInterval);
            clearInterval(apiInterval);
        };
    }, [selectedCity]);

    return (
      <div className={css.container}>
          <h1 className={css.title}>날씨 정보</h1>
          <div className={css.currentTime}>
              현재 시간: {currentTime.toLocaleTimeString()}
          </div>
          <div className={css.infoContainer}>
              <div className={css.leftContainer}>
                  <Button
                      className={css.button}
                      onClick={() => setShowDetailedWeather(!showDetailedWeather)} // 클릭 시 세부 데이터 표시/숨김
                  >
                      <div className={css.cityName}>대구</div>
                      <div className={css.temperature}>{weather.daegu?.temperature}°C</div>
                      <div className={css.humidity}>{weather.daegu?.humidity}%</div>
                      <div className={css.windSpeed}>{weather.daegu?.windSpeed} m/s</div>
                      <div className={css.description}>{weather.daegu?.description}</div>
                  </Button>
              </div>

              <div className={css.rightContainer}>
                  <div className={css.chartContainer}>
                      <h3>온도 그래프</h3>
                      <ResponsiveContainer width={300} height={200}>
                          <LineChart
                              data={detailedWeather.today.map(item => ({
                                  time: item.time.substring(0, 2) + '시',
                                  온도: item.temperature
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                              <CartesianGrid strokeDasharray="3 3" /> {/* 격자선을 점선으로 표시 */}
                              <XAxis
                                  dataKey="time"
                                  ticks={['00시', '06시', '12시', '18시']} // X축 시간대를 설정
                                  tick={{ fontSize: 14, textAnchor: 'front' }} 
                              />
                              <YAxis
                                  stroke="#000000" // Y축 글자 색상을 검은색으로 설정
                                  domain={[18, 40]} // Y축 범위를 18도부터 40도까지로 설정
                                  ticks={[18, 24, 30, 36, 40]} // 18, 24, 30, 36, 40에 격자선 추가
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
                                  time: item.time.substring(0, 2) + '시',
                                  습도: item.humidity
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                              <CartesianGrid strokeDasharray="3 3" /> {/* 격자선을 점선으로 표시 */}
                              <XAxis
                                  dataKey="time"
                                  ticks={['00시', '06시', '12시', '18시']} // X축 시간대를 설정
                                  tick={{ fontSize: 14, textAnchor: 'front' }} 
                              />
                              <YAxis
                                  stroke="#000000" // Y축 글자 색상을 검은색으로 설정
                                  domain={[0, 100]} // Y축 범위를 0부터 100까지 설정
                                  ticks={[0, 25, 50, 75, 100]} // 0, 25, 50, 75, 100에 격자선 추가
                                  tick={{ fontSize: 14 }} 
                                  interval={0}
                              />
                              <Tooltip />
                              <Legend />
                              <Line
                                  type="monotone"
                                  dataKey="습도"
                                  stroke="#87CEEB" // 하늘색으로 변경
                                  strokeWidth={3}
                              />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {showDetailedWeather && ( // 세부 데이터 표시 여부에 따른 조건부 렌더링
              <div className={css.weatherContainer}>
                  <h3>세부 날씨</h3>
                  <h4>{formatDateOnly(getCurrentDate())}</h4>
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
                                  <td>{formatTimeOnly(item.time)}</td>
                                  <td>{getSkyDescription(item.sky)}</td>
                                  <td>{item.temperature}°C</td>
                                  <td>{item.precipitation}</td>
                                  <td>{item.precipitationProbability}%</td>
                                  <td>{item.windSpeed} m/s</td>
                                  <td>{item.humidity}%</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  <h4>{formatDateOnly(getTomorrowDate())}</h4>
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
                                  <td>{formatTimeOnly(item.time)}</td>
                                  <td>{getSkyDescription(item.sky)}</td>
                                  <td>{item.temperature}°C</td>
                                  <td>{item.precipitation}</td>
                                  <td>{item.precipitationProbability}%</td>
                                  <td>{item.windSpeed} m/s</td>
                                  <td>{item.humidity}%</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  <h4>{formatDateOnly(getDayAfterTomorrowDate())}</h4>
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
                                  <td>{formatTimeOnly(item.time)}</td>
                                  <td>{getSkyDescription(item.sky)}</td>
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

