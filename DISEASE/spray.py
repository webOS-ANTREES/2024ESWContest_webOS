import pigpio
import time
import paho.mqtt.client as mqtt

SERVO_PIN_1 = 18
SERVO_PIN_2 = 27
BROKER_ADDRESS = "your_broker_address"  # Replace with your MQTT broker address
TOPIC = "your_topic"  # Replace with your desired topic

pi = pigpio.pi()  # 라즈베리 파이의 GPIO 제어

# 서보 모터 각도 설정 함수
def set_servo_angle(servo_pin, angle):
    pulse_width = 500 + (angle / 180.0) * 2000
    pi.set_servo_pulsewidth(servo_pin, pulse_width)

# MQTT 콜백 함수
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    command = msg.payload.decode()
    print(f"Received command: {command}")

    if command == "SPRAY":
        # 동작을 정의
        set_servo_angle(SERVO_PIN_1, 100)
        set_servo_angle(SERVO_PIN_2, 0)
        time.sleep(0.4)

        set_servo_angle(SERVO_PIN_1, 0)
        set_servo_angle(SERVO_PIN_2, 100)
        time.sleep(0.5)

        set_servo_angle(SERVO_PIN_1, 100)
        set_servo_angle(SERVO_PIN_2, 0)
        time.sleep(0.4)
    else:
        # 기본 상태로 모터 설정
        set_servo_angle(SERVO_PIN_1, 100)
        set_servo_angle(SERVO_PIN_2, 0)

# MQTT 클라이언트 설정
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# MQTT 브로커에 연결
client.connect(BROKER_ADDRESS, 1883, 60)

try:
    client.loop_start()  # Non-blocking loop to listen for messages
    while True:
        time.sleep(1)  # Keep the program running
except KeyboardInterrupt:
    pass
finally:
    pi.stop()  # pigpio 정지
    client.loop_stop()  # Stop the MQTT loop
