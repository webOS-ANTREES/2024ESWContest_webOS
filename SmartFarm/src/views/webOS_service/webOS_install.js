const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// IPK 파일 경로 설정
const appId = "com.smartfarm.app"; // 앱의 ID
const device = "webOS_raspberrypi4"; // 디바이스 이름
const ipkPath = path.join(__dirname, '../../../ipk');
const ipkFile = path.join(ipkPath, `${appId}_1.0.0_all.ipk`);

// 명령어 실행 함수
function runCommand(command, callback) {
    exec(command, (error, stdout, stderr) => {
        callback(error, stdout, stderr);
    });
}

// 앱 및 IPK 파일 삭제 후 재설치
function startProcess() {
    console.log("Starting the packaging process..."); 

    runCommand(`npm run pack-p`, (err) => {
        if (err) {
            console.log("Error during packaging:", err);
            return; 
        }
        console.log("Packaging completed successfully."); 

        console.log("Removing existing app..."); 
        runCommand(`ares-install -d ${device} -r ${appId}`, (err) => {
            if (err) {
                console.log("Existing app removal attempt failed (may not exist), continuing..."); 
            } else {
                console.log("Existing app removed successfully."); 
            }

            // 기존 IPK 파일 삭제
            if (fs.existsSync(ipkFile)) {
                fs.unlinkSync(ipkFile);
                console.log("Old IPK file deleted.");
            } else {
                console.log("No old IPK file found to delete.");
            }

            // 새로운 IPK 파일 생성
            console.log("Creating new IPK file...");
            runCommand(`ares-package dist -o ipk --no-minify`, (err) => { // ares-package dist -o ipk -> Error
                if (err) {
                    console.log("Error creating IPK:", err);
                    return;
                }
                console.log("New IPK file created successfully.");

                // IPK 파일 설치
                console.log("Installing new app...");
                runCommand(`ares-install -d ${device} ${ipkFile}`, (err) => {
                    if (err) {
                        console.log("Error installing app:", err);
                        return;
                    }
                    console.log("App installed successfully!");
                });
            });
        });
    });
}

startProcess();