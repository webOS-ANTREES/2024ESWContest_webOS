export const cities = {
    seoul: { name: '서울', nx: 60, ny: 127 },
    daegu: { name: '대구', nx: 89, ny: 90 },
    busan: { name: '부산', nx: 97, ny: 74 }
};

export const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export const getPreviousDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export const getDayAfterTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

export const getSkyDescription = (sky, pty) => {
    const ptyStr = String(pty);  // pty 값을 문자열로 변환
    const skyStr = String(sky);  // sky 값을 문자열로 변환

    if (ptyStr !== '0') {  // pty 값이 0이 아니면 강수 형태 처리
        switch (ptyStr) {
            case '1': return '비';
            case '2': return '비/눈';
            case '3': return '눈';
            case '4': return '소나기';
            default: return '';
        }
    }

    if (skyStr !== '0') {  // sky 값이 0이 아니면 하늘 상태 처리
        switch (skyStr) {
            case '1': return '맑음';
            case '3': return '구름 많음';
            case '4': return '흐림';
            default: return '';
        }
    }
};

export const formatPrecipitation = (precipitation) => {
    if (!precipitation || precipitation === '-' || precipitation === '강수없음') {
        return '강수없음';
    }
    const f = parseFloat(precipitation);
    if (f < 1.0) return "1.0mm 미만";
    else if (f >= 1.0 && f < 30.0) return `${f.toFixed(1)}mm`;
    else if (f >= 30.0 && f < 50.0) return "30.0~50.0mm";
    else return "50.0mm 이상";
};

export const formatDateOnly = (date) => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
};

export const formatTimeOnly = (time) => {
    const hour = String(parseInt(time.substring(0, 2))).padStart(2, '0');
    return `${hour}시`;
};

export const getClosestWeather = (weatherData, currentTime) => {
    return weatherData.reduce((closest, item) => {
        const itemTime = new Date(`${item.date.substring(0, 4)}-${item.date.substring(4, 6)}-${item.date.substring(6, 8)}T${item.time.substring(0, 2)}:00`);
        const closestTime = new Date(`${closest.date.substring(0, 4)}-${closest.date.substring(4, 6)}-${closest.date.substring(6, 8)}T${closest.time.substring(0, 2)}:00`);
        return Math.abs(currentTime - itemTime) < Math.abs(currentTime - closestTime) ? item : closest;
    });
};

export const fetchDetailedWeather = async (city, apiKey, setDetailedWeather, setWeather, currentTime) => {
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