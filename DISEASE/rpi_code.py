import serial
import time
import paho.mqtt.client as mqtt

# 아두이노와의 시리얼 연결 설정
ser = serial.Serial('/dev/ttyACM0', 9600)  # '/dev/ttyUSB0'는 아두이노가 연결된 포트 (라즈베리파이에서 확인 필요)

# MQTT 메시지 수신 콜백 함수
def on_message(client, userdata, message):
    command = message.payload.decode()
    if command == "ON":
        ser.write(b'1')  # 아두이노에 '1' 전송하여 모터 시작
    elif command == "OFF":
        ser.write(b'0')  # 아두이노에 '0' 전송하여 모터 정지

# MQTT 클라이언트 설정
broker_address = "165.229.185.243"  # 컴퓨터의 IP 주소 입력
client = mqtt.Client()
client.connect(broker_address)
client.subscribe("motor/control")  # 구독할 토픽 설정
client.on_message = on_message

# MQTT 클라이언트 루프 시작
client.loop_forever()
