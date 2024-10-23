# 제 22회 임베디드 소프트웨어 경진 대회 webOS부문 ANTREES팀

[![GitHub](https://img.shields.io/badge/GitHub-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/webOS-ANTREES)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/results?search_query=%EB%B9%84%EB%B9%94%EB%8C%80%EC%99%95)



## 작품명 : Berry Smart Farm

- 작품 간단 설명

## 기능
- [모니터링](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/SmartFarm/src/views/Monitoring)
- [병해충 관리](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/SmartFarm/src/views/PestManagement)
- [시스템 제어](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/SmartFarm/src/views/SystemControl)
- [알림](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/SmartFarm/src/views/Notice)
- [로봇팔](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/RobotArm)
- [인공지능](https://github.com/webOS-ANTREES/AI)
- [카메라](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/Test_Cam)
- [센서 코드 및 스텝모터](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002/tree/main/raspberryPi)
- [부가적인 기능](https://github.com/webOS-ANTREES/2024ESWContest_webOS_3002)
- 
## 차별성
시스템 제어
  - 온실 내부의 하나의 동작 제어가 아닌 여러 개의 동작을 제어할 수 있다. 이를 통해 온실 내부의 다양한 상황에 알맞은    동작 제어를 한 번에 할 수 있다. 또한 사용자가 동작을 직접 설정할 수 있어 사용자가 자신에 맞는 상황에 따라 제어할 수 있다.
	예 ) 햇빛이 강할 때 : 내벽 닫기, 천장 닫기, 천창 닫기
	      습도와 이산탄소가 높을 때 : 내벽 열기, 천장 열기, 천창 열기

자동 수확 및 병해충 제거
  - 사용자가 원할 때 로봇 팔을 동작 ON / OFF를 통해 스마트 팜 내부의 환경의 딸기 상태를 확인 가능하다.
	> 익은 딸기가 감지되면 자동 수확을 진행하고 수확된 딸기를 정해진 위치의 바구니에 담는 동작을 수행한다.
	> 병해충에 감염된 딸기가 감지되면 자동으로 방제를 하고, 해당 부위를 절단하여 병해충의 2차 감염을 예방함으로써 	   농장을 효과적으로 관리할 수 있다.
	> 사용자가 온실 내부의 병해충 걸린 딸기, 익은 딸기, 안 익은 딸기의 개수를 차트화를 통해 한 눈에 확인 가능하다.

시스템 제어와 자동 수확 및 병해충 제거에 대한 알림 저장
  - Toast알림을 통해 동작수행 제어에 대해 알림을 주고, 동작을 수행한 알림을 DB8에 저장하여 현재까지 동작했던 알림을 확인      할 수 있다. 
  - 사용자가 현재 온실 내부가 어떤 동작을 하고 있는지 쌓인 알림을 통해 마지막 동작 수행을 확인 가능하다.

## 기대효과

## 파일 구성
```bash
🗄️ webOS_SmartFarm
┃
┗ 📁 resources
┃   ┃
┃   ┗ 📁 images
┃
┗ 📁 src
┃   ┃
┃   ┗ 📁 APP
┃   ┃
┃   ┗ 📁 components
┃   ┃
┃   ┗ 📁 views
┃       ┃
┃       ┗ 📁 Firebase
┃       ┃
┃       ┗ 📁 Login
┃       ┃
┃       ┗ 📁 MenuPage
┃       ┃
┃       ┗ 📁 Monitoring
┃       ┃
┃       ┗ 📁 Notice
┃       ┃
┃       ┗ 📁 PestManagement
┃       ┃
┃       ┗ 📁 SignUp
┃       ┃
┃       ┗ 📁 StatusBar
┃       ┃
┃       ┗ 📁 SystemControl
┃       ┃
┃       ┗ 📁 webOS_service
┃
┗ 📜README.md

🗄️ raspberryPi
┃
┗📜 fram_sensor.ino
┃
┗📜 StepMotor_Ceiling.ino
┃
┗📜 StepMotor_Side.ino
┃
┗📜 StepMotor_Sky.ino
┃
┗ 📜 fram_snsor.py
┃
┗ 📜 auto_robot.py
┃
┗ 📜 spray.py

🗄️ AI
┃
┗ 📜 Crop_ObjDect&Rip&Dis.py

🗄️ Test_Cam
┃
┗ 📜 camera.py

🗄️ RobotArm
┃
┗ 📜 auto_mirobo.py
```


