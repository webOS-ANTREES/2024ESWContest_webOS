from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=False)
BROKER_ADDRESS = "172.20.48.180"  # MQTT 브로커 주소
TOPIC = "robot/location"  # 위치 값을 받을 토픽

current_slider_position = 0
is_forward_direction = True  # 처음에는 0에서 485로 이동

# 슬라이더 끝점 정의
SLIDER_MAX = 485 
SLIDER_MIN = 0 
SLIDER_MAX_EXTENDED = 970  # 확장된 슬라이더 범위
received_position_forward = None
received_position_reverse = None

position = None
received_x = None
received_z = None

# 알람 해제 (idle 상태로 전환)
def initialize_robot_arm(arm):
    print("Unlocking all axes and clearing alarm...")
    arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀
    time.sleep(1)  # 알람 해제 후 잠시 대기
    arm.home()
    target_angles = {1:-90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}
    arm.set_joint_angle(target_angles)  # 1번 관절을 180도 회전

# MQTT 메시지 콜백 함수
def on_message(client, userdata, message):
    global capture, received_position_forward,received_position_reverse,position,received_x,received_z
    try:
        # 메시지를 슬라이더 위치, X축, Z축 값으로 분리하여 처리 (예: "250,150,100")
        data = message.payload.decode("utf-8").split(',')
        position = int(data[0])  # 슬라이더 위치 값
        received_x = float(data[1])  # X값
        received_z = float(data[2])  # Z값
        
        # 0~485 값이면 received_position_forward에 저장
        if 0 <= position <= 485:
            received_position_forward = position
            print(f"Received forward position: {received_position_forward}, X: {received_x}, Z: {received_z}")

        # 485~970 값이면 received_position_reverse에 저장
        elif 485 < position <= 970:
            received_position_reverse = position
            print(f"Received reverse position: {received_position_reverse}, X: {received_x}, Z: {received_z}")

        else:
            print(f"Invalid position: {position}. Must be between {0} and {970}.")
    
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

def gripper_motion_forward():
    target_angles_forward = {1: -90.0, 2: 0.0, 3: 0.0, 4: 30.0, 5: 0.0, 6: 0.0}
    target_angles_forward_1 = {1: -90.0, 2: 50.0, 3: -60.0, 4: 30.0, 5: -90.0, 6: 0.0}
    target_angles_forward_2 = {1: -90.0, 2: 50.0, 3: -60.0, 4: 30.0, 5: 0.0, 6: 0.0}

    arm.set_joint_angle(target_angles_forward)
    time.sleep(1)
    arm.gripper_open()
    arm.set_joint_angle(target_angles_forward_1)
    arm.gripper_close()
    time.sleep(1)
    arm.set_joint_angle(target_angles_forward_2)
    time.sleep(1)
    arm.set_joint_angle(target_angles_forward)
    arm.gripper_open()
    
def gripper_motion_reverse():
    target_angles_forward = {1: 90.0, 2: 0.0, 3: 0.0, 4: 30.0, 5: 0.0, 6: 0.0}
    target_angles_forward_1 = {1: 90.0, 2: 50.0, 3: -60.0, 4: 30.0, 5: -90.0, 6: 0.0}
    target_angles_forward_2 = {1: 90.0, 2: 50.0, 3: -60.0, 4: 30.0, 5: 0.0, 6: 0.0}

    arm.set_joint_angle(target_angles_forward)
    time.sleep(1)
    arm.gripper_open()
    arm.set_joint_angle(target_angles_forward_1)
    arm.gripper_close()
    time.sleep(1)
    arm.set_joint_angle(target_angles_forward_2)
    time.sleep(1)
    arm.set_joint_angle(target_angles_forward)
    arm.gripper_open()

def rotate_robot_arm(arm, is_forward_direction):
    """로봇 팔의 몸통을 회전"""
    target_angles = {1:90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}
    reverse_angles = {1:-90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}

    if is_forward_direction:
        print("Rotating robot arm to 180 degrees (facing opposite)...")
        arm.set_joint_angle(target_angles)
    else:
        print("Rotating robot arm back to 0 degrees (facing forward)...")
        arm.set_joint_angle(reverse_angles)
    time.sleep(1)
    status = arm.get_status()
    print(f"Current robot arm pose: {status.cartesian}")
    print(f"Yaw: {status.cartesian.yaw}")

def move_slider(arm, is_forward_direction):
    """슬라이더를 이동시키는 함수"""
    if is_forward_direction:
        print(f"Moving slider to {SLIDER_MAX}mm position...")
        arm.set_speed(200)
        arm.set_slider_posi(150)
        time.sleep(1)
        mqtt_client.publish(TOPIC, "stop")
        arm.set_slider_posi(400)
        time.sleep(1)
        arm.set_slider_posi(SLIDER_MAX)
        time.sleep(1)
        rotate_robot_arm(arm, is_forward_direction)
        print("Pausing at 485mm position...")
        time.sleep(1)
        return False  # 새로운 슬라이더 위치와 방향 변경
    else:
        print(f"Moving slider to {SLIDER_MIN}mm position...")
        arm.set_slider_posi(400)
        time.sleep(1)
        arm.set_slider_posi(150)
        time.sleep(1)
        arm.set_slider_posi(SLIDER_MIN)
        time.sleep(1)
        rotate_robot_arm(arm, is_forward_direction)
        print("Pausing at 0mm position...")
        time.sleep(1)
        return True  # 새로운 슬라이더 위치와 방향 변경

def move_robot_to_strawberry(arm, x, z):
    """로봇팔을 딸기 위치로 이동"""
    print(f"Moving robot arm to pick strawberry at X: {x}, Z: {z}...")
    #arm.set_tool_pose(x=x, y=0, z=z, roll=0, pitch=0, yaw=0)
    time.sleep(1)

def map_logical_to_physical_position(position):
    """논리적인 위치값을 물리적인 위치값으로 변환"""
    global forward_direction
    if position <= 485:
        # 0~485 구간은 그대로 사용
        return position + SLIDER_MIN
    else:
        # 485~970 구간은 물리적인 위치값으로 변환 (예: 485은 485로, 970은 0으로 매핑)
        return SLIDER_MAX*2 - position

# 슬라이더의 현재 위치를 재설정하는 함수
def reset_slider_limits(arm, position,is_forward_direction):
    # 멈춘 지점을 새로운 0으로 간주하고 이동 범위를 조정
    if is_forward_direction:
        arm.set_slider_posi(SLIDER_MAX)
        is_forward_direction = False
        print("reset_slider 함수 끝! (Forward)")
    else:
        arm.set_slider_posi(SLIDER_MIN)
        is_forward_direction = True
        print("result_slider 함수 끝! (Reverse)")

    
def process_received_data(arm, received_data, is_forward_direction):
    """MQTT에서 받은 데이터를 처리하여 슬라이더와 로봇팔 동작"""
    global received_position_forward,received_position_reverse
    
    if received_position_forward is not None and is_forward_direction:
        #먼저 슬라이더를 끝까지 이동 후 방향 전환
        print(f"입력받은 데이터로 이동(forward)!!!")
        # 논리적 위치로 이동
        physical_position = map_logical_to_physical_position(received_data)
        arm.set_slider_posi(physical_position)
        time.sleep(1)
        gripper_motion_forward()
        reset_slider_limits(arm, physical_position, is_forward_direction)
        time.sleep(1)  # 슬라이더가 역방향 위치에 도달할 때까지 대기
        received_data = None
        
    elif received_position_reverse is not None and not is_forward_direction:  
        #먼저 슬라이더를 끝까지 이동 후 방향 전환
        print(f"입력받은 데이터로 이동(reverse)!!!")
        # 역방향으로 논리적 위치로 이동
        physical_position = map_logical_to_physical_position(received_data)
        arm.set_slider_posi(physical_position)
        time.sleep(1)
        gripper_motion_reverse()
        reset_slider_limits(arm, physical_position, is_forward_direction)
        time.sleep(1)  # 슬라이더가 역방향 위치에 도달할 때까지 대기
        received_data = None
    else:
        is_forward_direction = move_slider(arm, is_forward_direction)
    return is_forward_direction, current_slider_position


if __name__ == "__main__":
    # 로봇 팔 초기화
    initialize_robot_arm(arm)

    # MQTT 연결 설정
    mqtt_client = setup_mqtt()

    # 무한 반복 작업 실행
    while True:
        # forward 값이 있을 때 실행 (정방향)
        if received_position_forward is not None and is_forward_direction:  
            process_received_data(arm, received_position_forward, is_forward_direction)  # forward 위치로 슬라이더 이동
            received_position_forward = None  # 처리 후 값 초기화

        # reverse 값이 있을 때 실행 (역방향)
        elif received_position_reverse is not None and not is_forward_direction:  
            process_received_data(arm, SLIDER_MAX - (received_position_reverse - SLIDER_MAX), is_forward_direction)  # 물리적 위치로 변환하여 슬라이더 이동
            received_position_reverse = None  # 처리 후 값 초기화

        # 일반적인 슬라이더 동작 (forward와 reverse 값이 없을 때 기본 동작)
        else:
            is_forward_direction = move_slider(arm, is_forward_direction)  # 슬라이더를 기본 동작(0mm에서 485mm 또는 485mm에서 0mm)으로 이동
            print(is_forward_direction)

        # 짧은 대기 시간 추가
        time.sleep(1)
 