from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=True)

arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀



#끝

target_angles_forward = {1: -90.0, 2: 0.0, 3: 0.0, 4: 30.0, 5: 0.0, 6: 0.0}
target_angles_forward_1 = {1: 90.0, 2: 50.0, 3: -60.0, 4: 30.0, 5: -90.0, 6: 0.0}
target_angles_forward_2 = {1: -90.0, 2: 50.0, 3: -60.0, 4: 30.0, 5: 0.0, 6: 0.0}
#arm.set_joint_angle(target_angles_forward)
#time.sleep(1)
#arm.gripper_open()
arm.set_joint_angle(target_angles_forward_1)
#arm.gripper_close()
#time.sleep(1)
#arm.set_joint_angle(target_angles_forward_2)
time.sleep(1)
#arm.set_joint_angle(target_angles_forward)
#arm.gripper_open()
