const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// IPK 파일 경로 설정
const ipkPath = path.join(__dirname, 'C:/Users/antl/Documents/GitHub/2024ESWContest_webOS_3001/Test_App/Test/ipk');
const appId = "com.test.app"; // 앱의 ID
const device = "webOS_raspberrypi4"; // 디바이스 이름

// 명령어 실행 함수
function runCommand(command, callback) {
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            callback(error, null);
        } else {
            console.log(`Command executed successfully:\n${stdout}`);
            callback(null, stdout);
        }
    });
}

// 1. npm run pack-p 실행 함수
function packApp(callback) {
    console.log("Packaging the app...");
    runCommand('npm run pack-p', (error, stdout) => {
        if (error) {
            console.error("Failed to pack the app.");
            callback(error);
        } else {
            console.log("App packed successfully.");
            callback(null, stdout);
        }
    });
}

// 2. 앱 설치 상태 확인 함수
function checkAppInstalled(callback) {
    console.log("Checking if the app is installed on the device...");
    runCommand(`ares-install -d ${device} --list`, (error, stdout) => {
        if (error) {
            console.error("Failed to check installed apps.");
            callback(error, false);
        } else {
            if (stdout.includes(appId)) {
                console.log("App is installed.");
                callback(null, true);
            } else {
                console.log("App is not installed.");
                callback(null, false);
            }
        }
    });
}

// 3. 현재 설치된 앱 제거 함수
function removeApp(callback) {
    console.log("Removing the existing app from the device...");
    runCommand(`ares-install -d ${device} -r ${appId}`, (error, stdout) => {
        if (error) {
            console.warn("Failed to remove the app. It may not be installed or there was an error.");
            // 설치되지 않았거나 에러가 발생한 경우라도 다음 단계로 넘어가도록 처리
            callback(null); 
        } else {
            console.log("App removed successfully.");
            callback(null, stdout);
        }
    });
}

// 4. IPK 파일 제거 함수
function removeIpkFile(callback) {
    const ipkFile = path.join(ipkPath, `${appId}_1.0.0_all.ipk`);
    if (fs.existsSync(ipkFile)) {
        console.log("Removing the IPK file...");
        fs.unlink(ipkFile, (err) => {
            if (err) {
                console.error(`Error removing IPK file: ${err}`);
                callback(err);
            } else {
                console.log("IPK file removed successfully.");
                callback(null);
            }
        });
    } else {
        console.log("IPK file does not exist, skipping deletion.");
        callback(null);
    }
}

// 5. IPK 파일 생성 함수 (ares-package 실행)
function createIpk(callback) {
    console.log("Creating IPK file...");
    runCommand('ares-package dist -o ipk --no-minify', (error, stdout) => {
        if (error) {
            console.error("Failed to create IPK file.");
            callback(error);
        } else {
            console.log("IPK file created successfully.");
            callback(null, stdout);
        }
    });
}

// 6. IPK 파일 설치 함수
function installApp(callback) {
    console.log("Installing the new IPK file...");
    const ipkFile = path.join(ipkPath, `${appId}_1.0.0_all.ipk`);
    runCommand(`ares-install -d ${device} ${ipkFile}`, (error, stdout) => {
        if (error) {
            console.error("Failed to install the app.");
            callback(error);
        } else {
            console.log("App installed successfully.");
            callback(null, stdout);
        }
    });
}

// 전체 프로세스 실행
function startProcess() {
    console.log("Starting process...");
    packApp((err) => {
        if (!err) {
            checkAppInstalled((err, isInstalled) => {
                if (err) {
                    console.error("Error checking app installation.");
                    continueProcess(); // 오류 발생 시에도 계속 진행
                } else if (isInstalled) {
                    removeApp((err) => {
                        continueProcess(); // 앱 제거 후에도 계속 진행
                    });
                } else {
                    continueProcess(); // 설치되지 않은 경우 바로 진행
                }
            });
        }
    });
}

function continueProcess() {
    removeIpkFile((err) => {
        if (!err) {
            createIpk((err) => {
                if (!err) {
                    installApp((err) => {
                        if (!err) {
                            console.log("App reinstalled successfully!");
                        }
                    });
                }
            });
        }
    });
}

// 실행 시작
startProcess();