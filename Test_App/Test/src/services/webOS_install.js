const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// IPK 파일 경로 설정
const appId = "com.test.app"; // 앱의 ID
const device = "webOS_raspberrypi4"; // 디바이스 이름
const ipkPath = path.join(__dirname, '../ipk');
const ipkFile = path.join(ipkPath, `${appId}_1.0.0_all.ipk`);

// 명령어 실행 함수
function runCommand(command, callback) {
    exec(command, (error, stdout, stderr) => {
        callback(error, stdout, stderr);
    });
}

// 앱 및 IPK 파일 삭제 후 재설치
function startProcess() {
    runCommand(`npm run pack-p`, (err) => {
        if (err) return console.error("Error during packaging");

        // 앱 제거
        runCommand(`ares-install -d ${device} -r ${appId}`, () => {
            // 기존 IPK 파일 삭제
            if (fs.existsSync(ipkFile)) {
                fs.unlinkSync(ipkFile);
            }

            // 새로운 IPK 파일 생성
            runCommand(`ares-package dist -o ipk --no-minify`, (err) => {
                if (err) return console.error("Error creating IPK");

                // IPK 파일 설치
                runCommand(`ares-install -d ${device} ${ipkFile}`, (err) => {
                    if (err) return console.error("Error installing app");
                    console.log("App installed successfully!");
                });
            });
        });
    });
}

// 실행 시작
startProcess();