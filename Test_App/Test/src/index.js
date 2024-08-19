import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App/App';
import './index.css';
import './Firebase';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*
const express = require('express');
// 웹 서버를 구축하기 위함
const axios = require('axios');
// HTTP 요청을 보내기 위함
const path = require('path');
// 파일 및 디렉토리 경로를 다루기 위해
const app = express(); // Express 애플리케이션 객체를 생성
const PORT = 8080; // 포트 번호 설정

// 기상청 API 엔드포인트와 키 설정
const weatherAPI = 'https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php';
const apiKey = 'H9oTTLkoSY-aE0y5KImPQw'; // 실제 API 키로 교체

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public'))); // 서버가 public 디렉토리 내의 정적 파일을 제공하기 위함

// 날씨 데이터 가져오기 엔드포인트
// try, catch 문법 설명 : 일단 try실행 에러 없으면 끝까지 실행되고 catch 건너뛴다. but 도중에 에러 발생하면 catch로 간다.
app.get('/weather', async (req, res) => {
    // 로로 들어오는 GET 요청을 처리하는 핸들러입니다. 이 핸들러는 기상청 API에 비동기 요청을 보내서 날씨 데이터를 가져온 후, 필요한 정보를 추출하여 클라이언트에 응답
    try {
        const response = await axios.get(weatherAPI, {
            params: {
                tm: '202407290900', // 2024년 07월 29일 09:00 시 데이터
                stn: '90', // 특정 지역 코드로 변경 (예: 서울 108) -> 정확히 숫자가 어디 지역인지 모르겠음...
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
            const precipitation = columns[15]?.trim(); // 강수량(RN)
            const oneDayPrecipitation = columns[16]?.trim(); // 일강수량(RN_DAY)
            const sunlight = columns[33]?.trim(); // 일조량(SS)

            if (observationTime && observationTime.startsWith('20240729')) {
                result.push({ 
                    time: observationTime, 
                    temperature: temperature, 
                    relativeHumidity: relativeHumidity,
                    precipitation: precipitation,
                    oneDayPrecipitation: oneDayPrecipitation,
                    sunlight : sunlight
                });
            }
        });

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

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

*/