
from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt
import math
import queue

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='/dev/ttyUSB0', debug=False)
#arm.set_slider_posi(0)
arm.home_slider()
