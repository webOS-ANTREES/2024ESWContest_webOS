
"""
 * Project : 제 22회 임베디드 소프트웨어 경진대회 - 로봇팔 자동화 프로그램
 * Program Purpose and Features :
 * - Control Robot Arm With Python
 * Author : HG Kim
 * First Write Date : 2024.09.19
 * ============================================================
 * Program history
 * ============================================================
 * Author    		Date		    Version		            History
    HG Kim          2024.09.19      WLKATA_with_python      파이썬으로 로봇팔 제어 시도
    HG Kim          2024.09.10      WLKATA_with_python      로봇팔 슬라이더 제어 시도
    HG Kim          2024.09.11      WLKATA_with_python      로봇팔 슬라이더와 로봇팔 동시 제어 시도
    HG Kim          2024.09.12      WLKATA_with_python      일정 거리마다 멈춘 후 다시 정상 작동 시도
    HG Kim          2024.09.13      WLKATA_with_python      로봇팔에 부착된 이미지를 통해 받은 X좌표로 이동 시도
    HG Kim          2024.09.14      WLKATA_with_python      로봇팔에 부착된 이미지를 통해 받은 X좌표로 이동 시도
    HG Kim          2024.09.19      WLKATA_with_python      이미지 왜곡으로 인한 문제 해결
    HG Kim          2024.09.20      WLKATA_with_python      로봇팔과 딸기 거리 규격화 및 이미지를 통해 받은 X좌표로 이동 시도
    HG Kim          2024.09.27      WLKATA_with_python      로봇팔 Y축 구현 고려
    HG Kim          2024.09.28      WLKATA_with_python      로봇팔 Y축 구현 고려
    HG Kim          2024.09.29      WLKATA_with_python      로봇팔 Y축 구현 고려
    HG Kim          2024.10.01      WLKATA_with_python      로봇팔 Y축 구현 고려
    HG Kim          2024.10.02      WLKATA_with_python      딸기열매 한개 완벽 제거 완료
    HG Kim          2024.10.03      WLKATA_with_python      로봇팔 코드 자동화 프로그래밍 구현
    HG Kim          2024.10.04      WLKATA_with_python      로봇팔 코드 통신 제어 시도
    HG Kim          2024.10.05      WLKATA_with_python      로봇팔 코드 통신 제어 시도
    HG Kim          2024.10.06      WLKATA_with_python      로봇팔 코드 통신 제어 시도
    HG Kim          2024.10.07      WLKATA_with_python      딸기 열매 여러개 인식 시도
    HG Kim          2024.10.08      WLKATA_with_python      큐 자료형 사용 시도
    HG Kim          2024.10.09      WLKATA_with_python      큐 자료형 사용 시도
    HG Kim          2024.10.11      WLKATA_with_python      우선순위 큐 자료형 사용 시도
    
    
"""
from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt
import math
# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM9', debug=False)
BROKER_ADDRESS = "172.20.48.180"  # MQTT 브로커 주소
TOPIC = "robot/location"  # 위치 값을 받을 토픽

# 슬라이더 끝점 정의
SLIDER_MAX = 485 
SLIDER_MIN = 0 

# 방향값 초기화 
is_forward_direction = True
position = None
received_position_forward = None
received_position_reverse = None
forward_or_reverse = None
x_center = None
y_center = None
box_height = None

#데이터 정의 
forward_initial_angle = {1: -90.0, 2: -20.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
reverse_initial_angle = {1: 90.0, 2: -20.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
forward_store_angle = {1: 0.0, 2: 50.0, 3: 0.0, 4: 0.0, 5: -40.0, 6: 0.0}
reverse_store_angle = {1: 130.0, 2: 30.0, 3: 10.0, 4: 0.0, 5: -40.0, 6: 0.0}
before_store_angle_485 = {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0, 6: 0.0}
before_store_angle_0 = {1: 130.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0, 6: 0.0}
after_store_angle_485 = {1: 0.0, 2: -20.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
after_store_angle_0 = {1: 130.0, 2: -20.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
step_before_forward_target = {1: -90.0, 2: -30.0, 3: 10.0, 4: 10.0, 5: -90.0, 6: 0.0}
step_before_reverse_target = {1: 90.0, 2: -30.0, 3: 10.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_13cm_700px = {1: -90.0, 2: 5.0, 3: -12.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_11cm_600px = {1: -90.0, 2: 5.0, 3: -18.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_9cm_500px = {1: -90.0, 2: 10.0, 3: -28.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_7cm_400px = {1: -90.0, 2: 10.0, 3: -33.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_30cm_300px = {1: -90.0, 2: 12.0, 3: -41.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_28cm_200px = {1: -90.0, 2: 27.0, 3: -70.0, 4: 10.0, 5: -70.0, 6: 0.0}
a_26cm_100px = {1: -90.0, 2: 50.0, 3: -112.0, 4: 10.0, 5: -60.0, 6: 0.0}

# 높이와 px 값 매핑 테이블
px_mapping = {
    700: a_26cm_100px,
    600: a_28cm_200px,
    500: a_30cm_300px,
    400: a_7cm_400px,
    300: a_9cm_500px,
    200: a_11cm_600px,
    100: a_13cm_700px,
}

# MQTT 메시지 콜백 함수
def on_message(client, userdata, message):
    global capture, position, forward_or_reverse, x_center, y_center, box_height,received_position_forward,received_position_reverse
    try:
        # 메시지를 슬라이더 위치, X축, Z축 값으로 분리하여 처리 (예: "250,150,100")
        data = message.payload.decode("utf-8").split(',')
        position = int(data[0])  # 슬라이더 위치 값
        forward_or_reverse = str(data[1])  # X값
        x_center = float(data[2])  # Z값
        y_center = float(data[3])
        box_height = float(data[4])
        
        # 0~485 값이면 received_position_forward에 저장
        if 0 <= position <= 485:
            received_position_forward = position
            print(f"Received forward position: {received_position_forward}, {forward_or_reverse}, x_center : {x_center}, y_center : {y_center}, box_hgieht : {box_height}")

        # 485~970 값이면 received_position_reverse에 저장
        elif 485 < position <= 970:
            received_position_reverse = position
            print(f"Received reverse position: {received_position_reverse}, {forward_or_reverse}, x_center : {x_center}, y_center : {y_center}, box_hgieht : {box_height}")

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

# 알람 해제 (idle 상태로 전환)
def initialize_robot_arm(arm):
    print("Unlocking all axes and clearing alarm...")
    arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀
    arm.home()
    arm.set_joint_angle(forward_initial_angle)  # 1번 관절을 180도 회전
    arm.gripper_close()
    
def rotate_robot_arm(arm, is_forward_direction):
    """로봇 팔의 몸통을 회전"""
    if is_forward_direction:
        print("Rotating robot arm to reverse 180 degrees")
        arm.set_joint_angle(reverse_initial_angle)
    else:
        print("Rotating robot arm to front 180 degrees")
        arm.set_joint_angle(forward_initial_angle)
    
def move_slider(arm, is_forward_direction):
    global forward_or_reverse
    """슬라이더를 이동시키는 함수"""
    if is_forward_direction:
        print(f"Moving slider to {SLIDER_MAX}mm position...")
        
        # forward 첫번째 지점 이동
        arm.set_slider_posi(150)
        time.sleep(1)
        mqtt_client.publish(TOPIC, "stop_forward_150")
        
        # forward 두번째 지점 이동
        arm.set_slider_posi(400)
        time.sleep(1)
        mqtt_client.publish(TOPIC, "stop_forward_400")
        
        # forward 끝으로 이동
        arm.set_slider_posi(SLIDER_MAX)
        time.sleep(1)
        # if forward_or_reverse is not None:
        #     if forward_or_reverse.strip() == "forward":
        #         print("go to berry")
        #         return True
        # else:
        #     #회전
        #     rotate_robot_arm(arm, is_forward_direction)
        #     print("Pausing at 485mm position...")
        #     time.sleep(1)
        rotate_robot_arm(arm, is_forward_direction)
        print("Pausing at 485mm position...")
        time.sleep(1)
        return False  # 새로운 슬라이더 위치와 방향 변경
    else:
        print(f"Moving slider to {SLIDER_MIN}mm position...")
        
        # # reverse 첫번째 지점 이동
        arm.set_slider_posi(400)
        time.sleep(1)
        mqtt_client.publish(TOPIC, "stop_reverse_400")
        
        # reverse 두번째 지점 이동
        arm.set_slider_posi(150)
        time.sleep(1)
        mqtt_client.publish(TOPIC, "stop_reverse_150")
        
        # reverse 끝으로 이동
        arm.set_slider_posi(SLIDER_MIN)
        time.sleep(1)
        
        #회전
        rotate_robot_arm(arm, is_forward_direction)
        print("Pausing at 0mm position...")
        time.sleep(1)
        return True  # 새로운 슬라이더 위치와 방향 변경
    


#왜곡된 이미지를 위해 카메라를 딸기 근처로 이동시키는 함수
def calculate_camera_position(arm, x, current_position):
    global forward_or_reverse
    print(forward_or_reverse)
    # 하나의 연산으로 모든 값을 미리 계산하여 성능 개선
    calc_value = (640 - x) * 110
    quotient = calc_value // 640
    remainder = round((calc_value % 640) / 640, 2)
    
    if forward_or_reverse.strip() == "forward":
        result = math.ceil(quotient + remainder) + current_position
        print("go to forward_camera_position!")
    elif forward_or_reverse.strip() == "reverse":
        result = current_position - math.ceil(quotient + remainder) 
        print("go to reverse_camera_position!")
    else:
        print("error in calculate_camera_position function!!")
        
    arm.set_slider_posi(result)
    return result

#위의 식에서 나온 결과에 대해 다시해야함(그리퍼 x축을 딸기 위치로 이동)
def calculate_gripper_x_position(arm, x,current_position):
    global forward_or_reverse

    if x is None:
        print("Error: x_center is None, cannot calculate gripper position.")
        return None
    
    diff = 840 - x
    # 몫 계산
    quotient = diff // 51
    # 나머지 계산 후 소수점 둘째 자리까지 반올림
    remainder = round((diff % 51) / 51, 2)
    
    # 최종 결과 계산
    if forward_or_reverse.strip() == "forward" or forward_or_reverse.strip() == "captureforward":
        result = (quotient + remainder) * 10 + current_position
        print("go to forward_gripper_x_position!")
    elif forward_or_reverse.strip() == "reverse" or forward_or_reverse.strip() == "capturereverse":
        result = current_position - (quotient + remainder) * 10 
        print("go to reverse_gripper_x_position!")
    else:
        print("error in calculate_gripper_x_position function!!")
    arm.set_slider_posi(result)

    return result

#그리퍼 y축을 딸기 위치로 이동
def calculate_gripper_y_position(arm, y_pos):
    height = math.ceil(y_pos / 100) * 100
    if height==800:
        height = 700
    #500
    selected_variable = px_mapping.get(height, None)
    
    # selected_variable이 None이면 처리
    if selected_variable is None:
        print(f"No matching variable found for height {height}px.")
        return None
    
    print(f"Selected variable for height {height}px: {selected_variable}")
        # 최종 결과 계산
    if forward_or_reverse.strip() == "forward" or forward_or_reverse.strip() == "captureforward":
        arm.set_joint_angle(selected_variable)
        print("go to forward_gripper_y_position!")
    elif forward_or_reverse.strip() == "reverse" or forward_or_reverse.strip() == "capturereverse":
        reverse_selected_variable = selected_variable.copy()  # 얕은 복사
        reverse_selected_variable[1]=90
        arm.set_joint_angle(reverse_selected_variable)
        print("go to reverse_gripper_y_position!")
    else:
        print("error in calculate_gripper_y_position function!!")
    
def harvest_berry():
    global position,forward_or_reverse,x_center,y_center,box_height,is_forward_direction
    print(forward_or_reverse) 
    
    if is_forward_direction:
        if forward_or_reverse.strip() == "reverse":
            print("go to Slider_max for harv berry")
            arm.set_slider_posi(SLIDER_MAX)
            rotate_robot_arm(arm, is_forward_direction)
            is_forward_direction = False
            
    elif not is_forward_direction:
        if forward_or_reverse.strip() == "forward":
            print("go to Slider_min for harv berry")
            arm.set_slider_posi(SLIDER_MIN)
            rotate_robot_arm(arm, is_forward_direction)
            is_forward_direction = True
            
        
    if(x_center <= 440 or x_center >= 840):
        #카메라 위치로 이동
        print("There's distortion!!")
        cam_pos = calculate_camera_position(arm, x_center, position)
        print("camera_pos = ",cam_pos)

        #그리퍼 열기
        time.sleep(1)
        arm.gripper_open()
        time.sleep(1)
        #global 변수 초기화
        position = None
        x_center = None
        y_center = None
        box_height = None

        if forward_or_reverse.strip() == "forward":
            mqtt_client.publish(TOPIC, "capture_forward")
        elif forward_or_reverse.strip() == "reverse":
            mqtt_client.publish(TOPIC, "capture_reverse")
        time.sleep(5)
        #딸기 위치로 이동
        gripper_x_pos = calculate_gripper_x_position(arm, x_center, cam_pos)
    else:
        #딸기 위치로 이동
        print("There's no distortion!")
        gripper_x_pos = calculate_gripper_x_position(arm, x_center, position)
        time.sleep(1)
        arm.gripper_open()
    print( "gripper_x_pos = ", gripper_x_pos)
    time.sleep(1)
    
    # 최종 결과 계산
    if forward_or_reverse.strip() == "forward" or forward_or_reverse.strip() == "captureforward":
        arm.set_joint_angle(step_before_forward_target)
    elif forward_or_reverse.strip() == "reverse" or forward_or_reverse.strip() == "capturereverse":
        arm.set_joint_angle(step_before_reverse_target)

    #딸기 높이로 이동
    height = y_center - box_height / 2
    print( "gripper_y_pos = ", height)
    calculate_gripper_y_position(arm,height)
    time.sleep(1)
    #그리퍼 닫기(자르기)
    arm.gripper_close()
    print("success harvest berry")
    time.sleep(1)
    
    if forward_or_reverse.strip() == "forward" or forward_or_reverse.strip() == "captureforward":
        arm.set_joint_angle(step_before_forward_target)
        time.sleep(1)
        arm.set_joint_angle(forward_initial_angle)
        time.sleep(1)
        mqtt_client.publish("spary");
        #global 변수 초기화
        position = None
        forward_or_reverse = None
        x_center = None
        y_center = None
        box_height = None
        received_position_forward = None  # 처리 후 값 초기화
        arm.set_slider_posi(SLIDER_MAX)
        arm.set_joint_angle(before_store_angle_485)
        time.sleep(1)
        arm.set_joint_angle(forward_store_angle)
        time.sleep(1)
        arm.gripper_open()
        time.sleep(1)
        arm.set_joint_angle(after_store_angle_485)
        time.sleep(1)
        arm.gripper_close()
        rotate_robot_arm(arm, is_forward_direction)
        is_forward_direction=False
    elif forward_or_reverse.strip() == "reverse" or forward_or_reverse.strip() == "capturereverse":
        arm.set_joint_angle(step_before_reverse_target)
        time.sleep(1)
        arm.set_joint_angle(reverse_initial_angle)
        time.sleep(1)
        #global 변수 초기화
        position = None
        forward_or_reverse = None
        x_center = None
        y_center = None
        box_height = None
        received_position_forward = None  # 처리 후 값 초기화
        arm.set_slider_posi(SLIDER_MIN)
        arm.set_joint_angle(before_store_angle_0)
        time.sleep(1)
        arm.set_joint_angle(reverse_store_angle)
        time.sleep(1)
        arm.gripper_open()
        time.sleep(1)
        arm.set_joint_angle(after_store_angle_0)
        time.sleep(1)
        arm.gripper_close()
        rotate_robot_arm(arm, is_forward_direction)
        is_forward_direction=True

if __name__ == "__main__":
    # 로봇 팔 초기화
    initialize_robot_arm(arm)

    # MQTT 연결 설정
    mqtt_client = setup_mqtt()
    
    
    # 무한 반복 작업 실행
    while True:
        # forward 값이 있을 때 실행 (정방향)
        if forward_or_reverse is not None:
            print("=========================")
            harvest_berry()
        else:
            is_forward_direction = move_slider(arm, is_forward_direction)  # 슬라이더를 기본 동작(0mm에서 485mm 또는 485mm에서 0mm)으로 이동
            print(is_forward_direction)
        
