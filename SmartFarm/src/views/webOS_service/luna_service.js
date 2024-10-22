import LS2Request from '@enact/webos/LS2Request';

const webOSBridge = new LS2Request();
const kindID = "com.smartfarm.app:1"; // Kind의 고유 ID

// 시스템 시간 가져오기 함수
export const getSystemTime = (callback) => {
    const params = {};

    webOSBridge.send({
        service: 'luna://com.webos.service.systemservice/clock',
        method: 'getTime',
        parameters: params,
        onSuccess: (result) => {
            if (result.utc) {
                const dateObj = new Date(result.utc * 1000); // UTC를 밀리초로 변환
                const formattedTime = dateObj.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });
                callback(null, formattedTime);
            }
        },
    });
};

// Kind 등록
export const putKind = () => {
    const url = 'luna://com.webos.service.db';
    const params = {
        "id": kindID,
        "owner": "com.smartfarm.app",
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
                "caller": "com.smartfarm.app"
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
                "type": "toast",
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
            saveToastToDB(message); // Toast 성공 시 DB에 저장
        }
    });
};

// DB에서 저장된 알림을 조회하는 함수
export const getNotificationsFromDB = (callback) => {
    const params = {
        query: {
            from: kindID,
            where: [
                { prop: "type", op: "=", val: "toast" } // 'toast' 타입의 메시지만 조회
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
        "ids": [_id] // 삭제할 알림의 _id 값
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

// 설정값을 DB에 저장하는 함수 (타입 추가)
export const saveSettingsToDB = (type, settings) => {
    const params = {
        objects: [
            {
                "_kind": kindID,
                "temperature": settings.temperature,
                "humidity": settings.humidity,
                "co2": settings.co2,
                "illumination": settings.illumination,
                "type": type
            }
        ]
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "put",
        parameters: params,
        onSuccess: (result) => {
            console.log(`Settings for ${type} successfully saved to DataBase:`, JSON.stringify(result));
        },
        onFailure: (error) => {
            console.log(`Failed to save ${type} settings to DB:`, JSON.stringify(error));
        }
    });
};

// DB에서 저장된 설정값을 조회하는 함수
export const getSettingsFromDB = (type, callback) => {
    const params = {
        query: {
            from: kindID,
            where: [
                { prop: "type", op: "=", val: type }
            ]
        }
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "find",
        parameters: params,
        onSuccess: (result) => {
            if (result && result.results && result.results.length > 0) {
                console.log(`${type} settings found in DataBase.`, JSON.stringify(result));
                const latestSettings = result.results[result.results.length - 1]; // 제일 마지막 결과 가져오기
                callback(null, latestSettings);
            } else {
                console.log(`No ${type} settings found in DB.`);
                callback(null, null);
            }
        },
        onFailure: (error) => {
            console.log(`Fail to get ${type} settings from DB:`, JSON.stringify(error));
            callback(error, null);
        }
    });
};

// DB에서 설정값 삭제 함수 (타입 추가)
export const deleteSettingsFromDB = (type) => {
    const params = {
        query: {
            from: kindID,
            where: [
                { prop: "type", op: "=", val: type }
            ]
        }
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "del",
        parameters: params,
        onSuccess: (result) => {
            console.log(`${type} settings deleted from DB:`, result);
        },
        onFailure: (error) => {
            console.error(`Failed to delete ${type} settings:`, error);
        }
    });
};