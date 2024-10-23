from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=True)

arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀

# 1번 관절을 90도, 2번 관절을 0도로 설정
#시작
target_angles_1 = {1: 0.0, 2: 0.0, 3: 70.0, 4: 30.0, 5: -90.0, 6: 0.0}
arm.set_joint_angle(target_angles_1)