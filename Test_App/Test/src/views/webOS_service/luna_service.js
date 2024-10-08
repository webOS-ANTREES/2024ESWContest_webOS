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

export const putKind = () => {
    const url = 'luna://com.webos.service.db';  // 요청할 서비스 URL
    const params = {
        "id": kindID,
        "owner": "com.test.app",
        "indexes": [
            {
                "name": "index0",
                "props": [
                    {"name": "deviceName"}
                ]
            },
            {
                "name": "index1",
                "props": [
                    {"name": "location"}
                ]
            },
            {
                "name": "index2",
                "props": [
                    {"name": "status"}
                ]
            }
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
        hour12: true // 24시간 형식 사용
    });
    const params = {
        objects: [
            {
                "_kind": kindID,
                "message": message,
                "timestamp": formattedDate
            }
        ]
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "put",
        parameters: params
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
            from: kindID
        }
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "find",
        parameters: params,
        onSuccess: (result) => {
            if (callback) {
                callback(null, result.results);
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
           console.log("DB에서 알림 삭제 성공:", result);
           if (callback) callback(null);
       },
       onFailure: (error) => {
           console.error("DB에서 알림 삭제 실패:", error);
           if (callback) callback(error);
       }
   });
};