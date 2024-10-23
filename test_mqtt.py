import paho.mqtt.client as mqtt

# 메시지가 수신될 때 호출되는 콜백 함수
def on_message(client, userdata, message):
    print(f"Received message: {str(message.payload.decode('utf-8'))} on topic {message.topic}")

# MQTT 브로커에 연결했을 때 호출되는 콜백 함수
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker successfully!")
        # 특정 주제를 구독합니다.
        client.subscribe("robot/location")
    else:
        print(f"Failed to connect, return code {rc}")

# MQTT 클라이언트 생성
client = mqtt.Client()

# 콜백 함수 설정
client.on_message = on_message
client.on_connect = on_connect

# MQTT 브로커에 연결
broker_address = "172.20.48.180"  # MQTT 브로커의 IP 주소
client.connect(broker_address)

# 메시지 수신을 위한 루프 시작
client.loop_forever()
