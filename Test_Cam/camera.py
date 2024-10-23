from flask import Flask, Response
from flask_cors import CORS
import cv2
import paho.mqtt.client as mqtt
import time
import os
import requests

app = Flask(__name__)
CORS(app)

camera = cv2.VideoCapture(0)  # use 0 for web camera

# MQTT 설정
#broker = '172.20.48.180'  # 브로커 주소
#broker = "165.229.185.243"
#broker="192.168.50.248"
#태우 노트북 핫스팟
broker = "192.168.137.147"
#대장 핫스팟
# broker = "192.0.0.2"
port = 1883  # 브로커 포트 (기본 1883)
topic = 'robot/location'  # 수신할 토픽

# 서버 컴퓨터의 URL 설정 (서버는 Flask로 작동 중)
#server_url = 'http://192.168.50.248:8080/upload'  # 서버 컴퓨터의 IP 주소와 Flask 경로
# 대장 핫스팟
#server_url = 'http://192.0.0.2:8080/upload'
# 태우 노트북 핫스팟
server_url = 'http://192.168.137.147:8080/upload'
# 화면 캡처를 위한 플래그
capture_forward_150 = False
capture_forward_400 = False
capture_reverse_150 = False
capture_reverse_400 = False
capture_forward = False
capture_reverse = False


def send_image_to_server(image_path):
    """이미지를 서버로 전송하는 함수"""
    with open(image_path, 'rb') as image_file:
        files = {'file': image_file}
        response = requests.post(server_url, files=files)
        print(response.text)  # 서버의 응답 출력

def on_message(client, userdata, msg):
    global capture_forward_150, capture_forward_400, capture_reverse_150, capture_reverse_400, capture_forward, capture_reverse
    if msg.topic == topic and msg.payload.decode() == "stop_forward_150":
        capture_forward_150 = True
    elif msg.topic == topic and msg.payload.decode() == "stop_forward_400":
        capture_forward_400 = True
    elif msg.topic == topic and msg.payload.decode() == "stop_reverse_150":
        capture_reverse_150 = True
    elif msg.topic == topic and msg.payload.decode() == "stop_reverse_400":
        capture_reverse_400 = True
    elif msg.topic == topic and msg.payload.decode() == "capture_forward":
        capture_forward = True
    elif msg.topic == topic and msg.payload.decode() == "capture_reverse":
        capture_reverse = True

# MQTT 클라이언트 생성 및 콜백 함수 설정
mqtt_client = mqtt.Client()
mqtt_client.on_message = on_message

# 브로커에 연결 및 구독
mqtt_client.connect(broker, port)
mqtt_client.subscribe(topic)
mqtt_client.loop_start()

def gen_frames():
    global capture_forward_150, capture_forward_400, capture_reverse_150, capture_reverse_400, capture_forward, capture_reverse

    if not os.path.exists('/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection'):
        os.makedirs('/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection')

    while True:
        for _ in range(1):
            camera.grab()
        success, frame = camera.retrieve()  # 카메라 프레임 읽기
        if not success:
            break
        else:
            if capture_forward_150:  # 'stop' 명령을 받으면 프레임을 캡처
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images/150_forward_{timestamp}.jpg"
                cv2.imwrite(filename, frame)  # 프레임을 파일로 저장
                print(f"Frame captured and saved as {filename}")
                send_image_to_server(filename)
                capture_forward_150 = False  # 플래그 초기화

            if capture_forward_400:  # 'stop' 명령을 받으면 프레임을 캡처
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images/400_forward_{timestamp}.jpg"
                cv2.imwrite(filename, frame)  # 프레임을 파일로 저장
                print(f"Frame captured and saved as {filename}")
                send_image_to_server(filename)
                capture_forward_400 = False  # 플래그 초기화

            if capture_reverse_150:  # 'stop' 명령을 받으면 프레임을 캡처
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images/150_reverse_{timestamp}.jpg"
                cv2.imwrite(filename, frame)  # 프레임을 파일로 저장
                print(f"Frame captured and saved as {filename}")
                send_image_to_server(filename)
                capture_reverse_150 = False  # 플래그 초기화

            if capture_reverse_400:  # 'stop' 명령을 받으면 프레임을 캡처
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images/400_reverse_{timestamp}.jpg"
                cv2.imwrite(filename, frame)  # 프레임을 파일로 저장
                print(f"Frame captured and saved as {filename}")
                send_image_to_server(filename)
                capture_reverse_400 = False  # 플래그 초기화

            if capture_forward:  # 'capture_forward' 명령을 받으면 프레임을 캡처
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images/777_captureforward_{timestamp}.jpg"
                cv2.imwrite(filename, frame)  # 프레임을 파일로 저장
                print(f"Frame captured and saved as {filename}")
                send_image_to_server(filename)
                capture_forward = False  # 플래그 초기화

            if capture_reverse:  # 'capture_reverse' 명령을 받으면 프레임을 캡처
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images/777_capturereverse_{timestamp}.jpg"
                cv2.imwrite(filename, frame)  # 프레임을 파일로 저장
                print(f"Frame captured and saved as {filename}")
                send_image_to_server(filename)
                capture_reverse = False  # 플래그 초기화

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
