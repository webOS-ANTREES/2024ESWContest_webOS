import LS2Request from '@enact/webos/LS2Request';

const webOSBridge = new LS2Request();
const kindID = "com.test.app:1"; // Kind의 고유 ID

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
      parameters: params,
      onSuccess: (msg) => {
          console.log("Kind 생성 성공:", msg);
      },
      onFailure: (err) => {
          console.error("Kind 생성 실패:", JSON.stringify(err));
      }
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
       parameters: params,
       onSuccess: (result) => console.log("Permissions 설정 성공:", result),
       onFailure: (error) => console.error("Permissions 설정 실패:", error)
   });
}

// Toast 알림을 DB에 저장하는 함수
export const saveToastToDB = (message) => {
    const params = {
        objects: [
            {
                "_kind": kindID,
                "message": message,
                "timestamp": new Date().toISOString()
            }
        ]
    };

    webOSBridge.send({
        service: "luna://com.webos.service.db",
        method: "put",
        parameters: params,
        onSuccess: (result) => console.log("DB 저장 성공:", result),
        onFailure: (error) => console.error("DB 저장 실패:", error)
    });
};

// Toast 알림을 띄우는 함수
export const sendToast = (message) => {
    const params = { message };

    webOSBridge.send({
        service: "luna://com.webos.notification",
        method: "createToast",
        parameters: params,
        onSuccess: (result) => {
            console.log("Toast 성공:", result);
            saveToastToDB(message);  // Toast 성공 시 DB에 저장
        },
        onFailure: (error) => console.error("Toast 실패:", error)
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
            console.log("DB에서 가져온 알림들:", result.results);
            if (callback) {
                callback(null, result.results);
            }
        },
        onFailure: (error) => {
            console.error("DB에서 알림 가져오기 실패:", error);
            if (callback) {
                callback(error, null);
            }
        }
    });
};
