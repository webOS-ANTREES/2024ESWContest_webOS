import paho.mqtt.client as mqtt

broker_address = "165.229.185.243"  # 브로커가 실행 중인 컴퓨터
client = mqtt.Client()
# 기본 포트 사용
client.connect(broker_address)  # 포트를 명시적으로 설정 가능

# 모터를 돌리기 위한 신호 전송
client.publish("motor/control", "ON")
