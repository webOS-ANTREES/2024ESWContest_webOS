const express = require('express'); // 웹 서버를 구축하기 위함
const axios = require('axios');  // HTTP 요청을 보내기 위함
const path = require('path');  // 파일 및 디렉토리 경로를 다루기 위해
const cors = require('cors');  // 추가된 부분
const NodeCache = require('node-cache'); // 추가된 부분
const app = express(); // Express 애플리케이션 객체를 생성
const PORT = 5001; // 포트 번호 설정

const weatherCache = new NodeCache({ stdTTL: 300 }); // 캐시 유지 시간 300초(5분)

// 기상청 API 엔드포인트와 키 설정
const weatherAPI = 'https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php';
const apiKey = 'H9oTTLkoSY-aE0y5KImPQw'; // 실제 API 키로 교체

// CORS 설정 추가
app.use(cors());  // 추가된 부분

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public'))); // 서버가 public 디렉토리 내의 정적 파일을 제공하기 위함

// 기본 라우트 설정
app.get('/', (req, res) => {
    res.send('Hello, welcome to the weather server!');
});

// 날씨 데이터 가져오기 엔드포인트
// try, catch 문법 설명 : 일단 try실행 에러 없으면 끝까지 실행되고 catch 건너뛴다. but 도중에 에러 발생하면 catch로 간다.
app.get('/weather', async (req, res) => {
    // 로로 들어오는 GET 요청을 처리하는 핸들러입니다. 이 핸들러는 기상청 API에 비동기 요청을 보내서 날씨 데이터를 가져온 후, 필요한 정보를 추출하여 클라이언트에 응답
    try {
        const cachedData = weatherCache.get('weatherData'); // 캐시에서 데이터 가져오기
        if (cachedData) {
            return res.json(cachedData); // 캐시된 데이터가 있으면 반환
        }
        const response = await axios.get(weatherAPI, {
            params: {
                tm: '202408011500', // 2024년 07월 29일 09:00 시 데이터
                stn: '108', // 특정 지역 코드로 변경 (예: 서울 108) -> 정확히 숫자가 어디 지역인지 모르겠음...
                help: '1',
                authKey: apiKey
            },
            responseType: 'arraybuffer'
        });

        const rawData = Buffer.from(response.data, 'binary').toString('utf-8');
        const lines = rawData.split('\n');
        const result = [];

        // 데이터를 파싱하여 관측 시간(TM), 온도(TA), 상대습도(RH), 강수량, 일강수량만 추출
        lines.forEach(line => {
            if (line.trim() === '' || line.startsWith('#')) return; // 빈 줄과 주석 건너뛰기
            const columns = line.split(/\s+/);
            const observationTime = columns[0]?.trim(); // 관측 시간 (TM)
            const temperature = columns[11]?.trim(); // 온도 (TA)
            const relativeHumidity = columns[13]?.trim(); // 상대습도 (RH)

            if (observationTime && observationTime.startsWith('20240801')) {
                result.push({ 
                    time: observationTime, 
                    temperature: temperature, 
                    relativeHumidity: relativeHumidity
                });
            }
        });
        weatherCache.set('weatherData', result); // 캐시에 데이터 저장
        res.json(result);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// 센서값을 받아오기 위한 함수
app.get('/sensor', (req, res) => {
    try {
        const sensorData = {
            temperature: (Math.random() * 10 + 20).toFixed(2),
            humidity: (Math.random() * 50 + 30).toFixed(2),
            airQuality: (Math.random() * 100).toFixed(2),
            light: (Math.random() * 1000).toFixed(2)
        };

        res.json(sensorData);
    } catch (error) {
        console.error('Error generating sensor data:', error.message);
        res.status(500).json({ error: 'Failed to generate sensor data' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

