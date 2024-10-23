from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=True)

arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀
arm.home()