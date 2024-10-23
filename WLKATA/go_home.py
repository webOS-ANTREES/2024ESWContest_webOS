from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=True)

arm.home_slider()