import LS2Request from '@enact/webos/LS2Request';

const webOSBridge = new LS2Request();
const kindID = "com.test.app:1"; // Kind의 고유 ID

// 시스템 시간 가져오기 함수
export const getSystemTime = (callback) => {
    const params = {};

    webOSBridge.send({
        service: 'luna://com.webos.service.systemservice/clock',  // 시스템 시간 가져오기 서비스
        method: 'getTime',
        parameters: params,
        onSuccess: (result) => {
            if (result.utc) {
                const dateObj = new Date(result.utc * 1000); // UTC를 밀리초로 변환
                const formattedTime = dateObj.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true, // 12시간 형식
                    hourCycle: 'h12', // 선행 0 제거
                });
                callback(null, formattedTime); // 콜백을 통해 전달
            }
        },
    });
};

// Kind 등록
export const putKind = () => {
    const url = 'luna://com.webos.service.db';  // 요청할 서비스 URL
    const params = {
        "id": kindID,
        "owner": "com.test.app",
        "indexes": [
            {
                "name": "index0",
                "props": [
                    { "name": "deviceName" }
                ]
            },
            {
                "name": "index1",
                "props": [
                    { "name": "type" }
                ]
            },
        ]
    };

    webOSBridge.send({
        service: url,
        method: "putKind",
        parameters: params
    });
}

// 권한 설정 함수
export const putPermissions = () => {
    const params = {
        "permissions": [
            {
                "operations": {
                    "read": "allow",
                    "create": "allow",
                    "update": "allow",
                    "delete": "allow"
                },
                "object": kindID,
                "type": "db.kind",
                "caller": "com.test.app"
            }
        ]
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "putPermissions",
        parameters: params
    });
}

// Toast 알림을 DB에 저장하는 함수
export const saveToastToDB = (message) => {
    const formattedDate = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });
    const params = {
        objects: [
            {
                "_kind": kindID,
                "message": message,
                "type": "toast",  // 메시지 타입 지정
                "timestamp": formattedDate
            }
        ]
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "put",
        parameters: params,
        onSuccess: (result) => {
            console.log("Success", result);
        },
        onFailure: (error) => {
            console.log("Fail", error);
        }
    });
};

// Toast 알림을 띄우는 함수
export const sendToast = (message) => {
    const params = { message };

    webOSBridge.send({
        service: "luna://com.webos.notification",
        method: "createToast",
        parameters: params,
        onSuccess: () => {
            saveToastToDB(message);  // Toast 성공 시 DB에 저장
        }
    });
};

// DB에서 저장된 알림을 조회하는 함수
export const getNotificationsFromDB = (callback) => {
    const params = {
        query: {
            from: kindID,
            where: [
                { prop: "type", op: "=", val: "toast" }  // 'toast' 타입의 메시지만 조회
            ]
        }
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "find",
        parameters: params,
        onSuccess: (result) => {
            if (callback) {
                callback(null, result.results || []);
            }
        },
        onFailure: (error) => {
            if (callback) {
                callback(error, null);
            }
        }
    });
};

// DB에서 알림 삭제 함수
export const deleteNotificationFromDB = (_id, callback) => {
    const params = {
        "ids": [_id]  // 삭제할 알림의 _id 값
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "del",
        parameters: params,
        onSuccess: (result) => {
            if (callback) callback(null, result.results);
        },
        onFailure: (error) => {
            if (callback) callback(error);
        }
    });
};

// 설정값을 DB에 저장하는 함수
export const saveSettingsToDB = (settings) => {
    const params = {
        objects: [
            {
                "_kind": kindID,  // 설정과 관련된 Kind ID (같은 Kind 사용)
                "temperature": settings.temperature,
                "humidity": settings.humidity,
                "co2": settings.co2,
                "illumination": settings.illumination,
                "type": "settings"  // 설정에 대한 타입 지정
            }
        ]
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "put",
        parameters: params,
        onSuccess: (result) => {
            console.log("Settings successfully saved to DataBase:", JSON.stringify(result));
        },
        onFailure: (error) => {
            console.log("Failed to save settings to DB:", JSON.stringify(error));
        }
    });
};

// DB에서 저장된 설정값을 조회하는 함수
export const getSettingsFromDB = (callback) => {
    const params = {
        query: {
            from: kindID,  // 같은 Kind ID 사용
            where: [
                { prop: "type", op: "=", val: "settings" }  // 'settings' 타입의 메시지만 조회
            ]
        }
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "find",
        parameters: params,
        onSuccess: (result) => {
            if (result && result.results && result.results.length > 0) {
                const latestSettings = result.results[result.results.length - 1];  // 제일 마지막 결과 가져오기
                callback(null, latestSettings);  // 최신 결과 콜백으로 전달
            } else {
                console.log("No settings found in DB.");
                callback(null, []);  // 결과가 없을 경우 빈 배열 반환
            }
        },
        onFailure: (error) => {
            console.log("Fail to get from DB:", JSON.stringify(error));  // 오류 로그 출력
            callback(error, null);
        }
    });
};

export const deleteSettingsFromDB = () => {
    const params = {
        query: {
            from: kindID,
            where: [
                { prop: "type", op: "=", val: "settings" }  // 'settings' 타입의 데이터를 삭제
            ]
        }
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "del",
        parameters: params,
        onSuccess: (result) => {
            console.log("Settings deleted from DB:", result);
        },
        onFailure: (error) => {
            console.error("Failed to delete settings:", error);
        }
    });
};