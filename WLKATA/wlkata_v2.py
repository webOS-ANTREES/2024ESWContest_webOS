from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=True)

BROKER_ADDRESS = "172.20.48.180"  # MQTT 브로커 주소
TOPIC = "robot/location"  # 위치 값을 받을 토픽
received_position_forward = None  # 정방향으로 받은 위치 값 (0~485)
received_position_reverse = None  # 역방향으로 받은 위치 값 (485~970)
received_x = None
received_y = None
received_direction = None

# 알람 해제 (idle 상태로 전환)
print("Unlocking all axes and clearing alarm...")
arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀
time.sleep(2)  # 알람 해제 후 잠시 대기
arm.home()
target_angles = {1:-90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}
arm.set_joint_angle(target_angles)  # 1번 관절을 180도 회전
# 슬라이더 끝점 정의
SLIDER_MAX = 485
SLIDER_MIN = 0
SLIDER_MAX_EXTENDED = 970  # 확장된 슬라이더 범위

# 현재 방향 (True: 485로 이동 중, False: 0으로 이동 중)
forward_direction = True  # 처음에는 0에서 485로 이동
target_angles = {1:90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}
reverse_angles = {1:-90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}

# MQTT 메시지 콜백 함수
def on_message(client, userdata, message):
    global received_position_forward, received_position_reverse, received_x, received_z
    try:
        # 메시지를 슬라이더 위치, X축, Z축 값으로 분리하여 처리 (예: "250,150,100")
        data = message.payload.decode("utf-8").split(',')
        position = int(data[0])  # 슬라이더 위치 값
        received_x = float(data[1])  # X값
        received_z = float(data[2])  # Z값
        # 0~485 값이면 received_position_forward에 저장
        if SLIDER_MIN <= position <= SLIDER_MAX:
            received_position_forward = position
            print(f"Received forward position: {received_position_forward}, X: {received_x}, Z: {received_z}")

        # 485~970 값이면 received_position_reverse에 저장
        elif SLIDER_MAX < position <= SLIDER_MAX_EXTENDED:
            received_position_reverse = position
            print(f"Received reverse position: {received_position_reverse}, X: {received_x}, Z: {received_z}")

        else:
            print(f"Invalid position: {position}. Must be between {SLIDER_MIN} and {SLIDER_MAX_EXTENDED}.")
    
    except (ValueError, IndexError):
        print("Invalid values received.")

# MQTT 설정 함수
def setup_mqtt():
    client = mqtt.Client()
    client.on_message = on_message
    client.connect(BROKER_ADDRESS)
    client.subscribe(TOPIC)
    client.loop_start()  # 백그라운드에서 MQTT 메시지 수신 시작
    return client

def rotate_robot_arm():
    """로봇 팔의 몸통을 180도 회전"""
    global forward_direction
    if forward_direction:
        print("Rotating robot arm to 180 degrees (facing opposite)...")
        arm.set_joint_angle(target_angles)  # 1번 관절을 180도 회전

    else:
        print("Rotating robot arm back to 0 degrees (facing forward)...")
        arm.set_joint_angle(reverse_angles)  # 1번 관절을 반대로 180도 회전

    # 상태 확인을 위한 대기 시간 추가
    time.sleep(1)

    # 로봇 팔의 현재 상태 확인
    status = arm.get_status()
    print(f"Current robot arm pose: {status.cartesian}")  # cartesian은 객체의 속성
    print(f"Yaw: {status.cartesian.yaw}")  # yaw 값 확인

def move_robot_to_strawberry(x, z):
    """X, Z 값에 따라 로봇팔을 이동하여 딸기 따기 동작 수행"""
    print(f"Moving robot arm to pick strawberry at X: {x}, Z: {z}...")
    arm.set_tool_pose(x=received_x, y=0, z=received_z, roll=0, pitch=0, yaw=0)  # Y는 0, 회전 없이 X, Z로만 이동
    time.sleep(1)  # 딸기 위치로 이동 후 대기
    
def map_logical_to_physical_position(position):
    """논리적인 위치값을 물리적인 위치값으로 변환"""
    global forward_direction
    if 0 <= position <= SLIDER_MAX:
        # 0~485 구간은 그대로 사용
        return position
    else:
        # 485~970 구간은 물리적인 위치값으로 변환 (예: 485은 485로, 970은 0으로 매핑)
        return SLIDER_MAX - (position - SLIDER_MAX)

def move_slider():
    """슬라이더를 이동시키는 함수"""
    global forward_direction

    if forward_direction:
        print(f"Moving slider to {SLIDER_MAX}mm position...")
        arm.set_slider_posi(SLIDER_MAX)  # 슬라이더를 485mm로 이동
        time.sleep(1)  # 슬라이더가 이동하는 동안 대기
        
        # 로봇 팔을 180도 회전
        rotate_robot_arm()
        
        # 잠시 대기
        print("Pausing at 485mm position...")
        time.sleep(1)

        # 방향을 반대로 변경 (485 -> 0으로 이동)
        forward_direction = False

    else:
        print(f"Moving slider to {SLIDER_MIN}mm position...")
        arm.set_slider_posi(SLIDER_MIN)  # 슬라이더를 0mm로 이동
        time.sleep(1)  # 슬라이더가 이동하는 동안 대기

        # 로봇 팔을 180도 회전
        rotate_robot_arm()

        # 잠시 대기
        print("Pausing at 0mm position...")
        time.sleep(1)

        # 방향을 다시 485로 변경
        forward_direction = True

def move_slider_to_position(logical_position):
    """슬라이더를 받은 위치로 이동시키는 함수"""
    physical_position = map_logical_to_physical_position(logical_position)
    print(f"Moving slider to logical position {logical_position}mm (physical position {physical_position}mm)...")
    
    time.sleep(2)  # 받은 위치에서 2초간 대기

     # X, Z 값에 따라 로봇팔을 딸기 따기 위치로 이동
    #move_robot_to_strawberry(received_x, received_z)
    #arm.home()
    if forward_direction:
        arm.set_slider_posi(SLIDER_MAX-physical_position)
        arm.set_joint_angle(reverse_angles)
        arm.set_slider_posi(-150)
    else:
        arm.set_slider_posi(physical_position)
        arm.set_joint_angle(target_angles)

     
 
if __name__=="__main__":
    # MQTT 연결 설정
    mqtt_client = setup_mqtt()

    # 무한 반복 작업 실행
    while True:
        if received_position_forward is not None and forward_direction:  # forward 값이 있을 때 실행
            move_slider_to_position(received_position_forward)
            received_position_forward = None  # 처리 후 값 초기화s
            forward_direction=True
            move_slider()

        elif received_position_reverse is not None and not forward_direction:  # reverse 값이 있을 때 실행
            move_slider_to_position(SLIDER_MAX - (received_position_reverse - SLIDER_MAX))  # 물리적 위치로 변환하여 실행
            received_position_reverse = None  # 처리 후 값 초기화
            forward_direction=True

        else:   
            move_slider()  # 0과 485 사이로 이동하는 기본 동작 수행