"""
 * Project : 제 22회 임베디드 소프트웨어 경진대회 - 로봇팔 자동화 프로그램
 * Program Purpose and Features :
 * - Control Robot Arm With Python
 * Author : HG Kim
 * First Write Date : 2024.09.19
 * ============================================================
 * Program history
 * ============================================================
 * Author          Date          Version                  History
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
    JY Seong        2024.
    
    
"""
from wlkata_mirobot import WlkataMirobot
import time
import paho.mqtt.client as mqtt
import math
import queue

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='/dev/tty.usbserial-1110', debug=False)
#BROKER_ADDRESS  = "172.20.48.180"  # MQTT 브로커 주소
#BROKER_ADDRESS = "192.168.50.248"
# 태우 노트북 핫스팟
BROKER_ADDRESS = "192.168.137.147"
#대장 핫스팟
#BROKER_ADDRESS = "192.0.0.2"
#BROKER_ADDRESS = "165.229.185.243"
TOPIC = "robot/location"  # 위치 값을 받을 토픽

# 슬라이더 끝점 정의
SLIDER_MAX = 485 
SLIDER_MIN = 0 

# 방향값 초기화 
is_forward_direction = True
position = None
normal_or_abnormal = None
received_position_forward = None
received_position_reverse = None
forward_or_reverse = None
x_center = None
y_center = None
box_height = None
operating_message = None
num_queue_data = 0
#데이터 정의 
forward_initial_angle = {1: -90.0, 2: -25.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
reverse_initial_angle = {1: 90.0, 2: -25.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
forward_store_angle = {1: 0.0, 2: 50.0, 3: 0.0, 4: 0.0, 5: -40.0, 6: 0.0}
reverse_store_angle = {1: 130.0, 2: 30.0, 3: 10.0, 4: 0.0, 5: -40.0, 6: 0.0}
before_store_angle_forward = {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0, 6: 0.0}
before_store_angle_reverse = {1: 130.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0, 6: 0.0}
after_store_angle_forward = {1: 0.0, 2: -20.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
after_store_angle_reverse = {1: 130.0, 2: -20.0, 3: 60.0, 4: 0.0, 5: -20.0, 6: 0.0}
step_before_forward_target = {1: -90.0, 2: -30.0, 3: 10.0, 4: 10.0, 5: -90.0, 6: 0.0}
step_before_reverse_target = {1: 90.0, 2: -30.0, 3: 10.0, 4: 10.0, 5: -90.0, 6: 0.0}
a_11cm_600px = {1: -90.0, 2: 0.0, 3: -10.0, 4: 5.0, 5: -90.0, 6: 0.0}
a_9cm_500px = {1: -90.0, 2: 5.0, 3: -20.0, 4: 5.0, 5: -85.0, 6: 0.0}
a_7cm_400px = {1: -90.0, 2: 8.0, 3: -30.0, 4: 5.0, 5: -80.0, 6: 0.0}
a_30cm_300px = {1: -90.0, 2: 12.0, 3: -40.0, 4: 5.0, 5: -75.0, 6: 0.0}
a_28cm_200px = {1: -90.0, 2: 33.0, 3: -77.0, 4: 5.0, 5: -57.0, 6: 0.0}
a_26cm_100px = {1: -90.0, 2: 48.0, 3: -100.0, 4: 5.0, 5: -67.0, 6: 0.0}

# 높이와 px 값 매핑 테이블
px_mapping = {
    600: a_11cm_600px,
    500: a_9cm_500px,   # 500이 300px에 매핑
    400: a_7cm_400px,
    300: a_30cm_300px,  # 300px이므로 300
    200: a_28cm_200px,
    100: a_26cm_100px,
}

# 우선순위 큐 생성
priority_queue = queue.PriorityQueue()



def keep_closest_640_for_777(priority_queue):
    
    temp_queue = queue.PriorityQueue()
    closest_data = None
    min_diff = float('inf')  # 초기값을 무한대로 설정

    # 첫 번째 값이 777인 데이터 중에서 640에 가장 가까운 세 번째 값을 찾음
    while not priority_queue.empty():
        priority, data = priority_queue.get()
      

        if priority == 0 and data[0] == '777':  # priority와 첫 번째 값이 777인지 확인
            third_value = float(data[3].strip())  # 공백 제거 후 float로 변환
            diff = abs(640 - third_value)  # 640과의 차이 계산

            if diff < min_diff:
                # 현재 가장 가까운 데이터를 갱신
                min_diff = diff
                closest_data = (priority, data)
            else:
                print(f"Removed: {priority}, {data}")  # 제거할 데이터 출력
        else:
            temp_queue.put((priority, data))  # 777이 아닌 데이터 또는 priority가 0이 아닌 데이터는 임시 큐에 저장

    # 가장 가까운 데이터만 다시 큐에 추가
    if closest_data is not None:
        temp_queue.put(closest_data)  # closest_data는 (priority, data)로 되어 있음
        print(f"Kept: {closest_data}")

    # 원래 큐에 임시 큐의 데이터를 다시 채워 넣음
    while not temp_queue.empty():
        priority_queue.put(temp_queue.get())

    print_queue_contents(priority_queue)
    return priority_queue
        
# 메시지를 우선순위 큐에 삽입하는 함수
def enqueue_message(data):
    global priority_queue,num_queue_data
    # 첫 번째 데이터 (슬라이더 위치 값) 가져오기
    position = int(data[0])

    # 우선순위 설정: position이 777이면 최우선 처리, 그렇지 않으면 일반 순서
    priority = 0 if position == 777 else 1

    # 우선순위 큐에 (우선순위, 데이터)를 넣음
    priority_queue.put((priority, data))
    num_queue_data+=1

# 데이터를 처리하고 전역 변수에 저장하는 함수
def store_data_in_globals(data):
    global position, forward_or_reverse, x_center, y_center, box_height, normal_or_abnormal

    position = None
    forward_or_reverse = None
    normal_or_abnormal = None
    x_center = None
    y_center = None
    box_height = None
        
    try:
        # data 배열에서 값을 추출하여 전역 변수에 저장
        position = int(data[0])
        forward_or_reverse = str(data[1])
        normal_or_abnormal = str(data[2])
        x_center = float(data[3])
        y_center = float(data[4])
        box_height = float(data[5])

        print(f"Data stored in globals - position: {position}, forward_or_reverse: {forward_or_reverse}, normal_or_abnormal: {normal_or_abnormal}, x_center: {x_center}, y_center: {y_center}, box_height: {box_height}")

    except (ValueError, IndexError) as e:
        print(f"Error storing data in globals: {e}")
    
# MQTT 메시지 콜백 함수
def on_message(client, userdata, message):
    global position, priority_queue,num_queue_data,operating_message

    if message.payload.decode() == "ON" or message.payload.decode() == "OFF":
        operating_message = message.payload.decode()  # 메시지 디코딩
        print(f"Received message: {operating_message}")  # 수신된 메시지 출력
     


    try:
        # MQTT 메시지 페이로드를 디코딩하여 처리
        message_payload = message.payload.decode("utf-8")
        data = message_payload.split(',')
        if len(data) >= 3:  # 데이터 길이를 적절하게 조정, 최소 3개 값 필요
            enqueue_message(data) 
            print("success {} enqueue".format(num_queue_data))
            

    except (ValueError, IndexError):
        print("Invalid values received.")

# MQTT 설정 함수
def setup_mqtt():
    client = mqtt.Client()
    client.on_message = on_message
    client.connect(BROKER_ADDRESS)  # 1884로 포트 변경
    client.subscribe(TOPIC)
    client.loop_start()  # 백그라운드에서 MQTT 메시지 수신 시작
    return client

# 알람 해제 (idle 상태로 전환)
def initialize_robot_arm(arm):
    print("Unlocking all axes and clearing alarm...")
    arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀
    arm.home()
    arm.set_joint_angle(forward_initial_angle)
    
    
def rotate_robot_arm(arm, is_forward_direction):
    """로봇 팔의 몸통을 회전"""
    if is_forward_direction:
        arm.set_joint_angle(reverse_initial_angle)
    else:
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
    
    if forward_or_reverse.strip() == "forward" or forward_or_reverse.strip() == "captureforward":
        result = math.ceil(quotient + remainder) + current_position
        print("go to forward_camera_position!")
    elif forward_or_reverse.strip() == "reverse" or forward_or_reverse.strip() == "capturereverse":
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
    
    diff = 837 - x
    # 몫 계산
    quotient = diff // 56
    # 나머지 계산 후 소수점 둘째 자리까지 반올림
    remainder = round((diff % 56) / 56, 2)
    
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
    
# 우선순위 큐 안의 데이터를 출력하는 함수
def print_queue(priority_queue):
    temp_queue = queue.PriorityQueue()  # 데이터를 임시로 보관할 큐
    
    # 큐가 비어있지 않은 동안 데이터를 하나씩 꺼내어 출력
    while not priority_queue.empty():
        priority, data = priority_queue.get()  # 데이터를 꺼내고
        print(f"Priority: {priority}, Data: {data}")  # 데이터 출력
        temp_queue.put((priority, data))  # 임시 큐에 다시 저장

    # 임시 큐에 저장된 데이터를 다시 원래 큐로 복원
    while not temp_queue.empty():
        priority_queue.put(temp_queue.get())
        
def harvest_berry():
    global position,forward_or_reverse,x_center,y_center,box_height,is_forward_direction, priority_queue,num_queue_data,normal_or_abnormal
    print(forward_or_reverse) 
    while True:
        print_queue_contents(priority_queue)
        priority, data = priority_queue.get()
        num_queue_data -=1
        store_data_in_globals(data)
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
        
        if (x_center <= 440 or x_center >= 840):
            #카메라 위치로 이동
            print("There's distortion!!")
            cam_pos = calculate_camera_position(arm, x_center, position)
            print("camera_pos = ",cam_pos)

            #그리퍼 열기
            time.sleep(1)
            arm.gripper_open()
            time.sleep(1)
            tmp_position = 0
            tmp_position = position

            if forward_or_reverse.strip() == "forward":
                mqtt_client.publish(TOPIC, "capture_forward")
            elif forward_or_reverse.strip() == "reverse":
                mqtt_client.publish(TOPIC, "capture_reverse")
            time.sleep(5)
            print("get rid of rest data at 777")
            print_queue_contents(priority_queue)
            priority_queue = keep_closest_640_for_777(priority_queue)
            print("finish get rid of rest data at 777")
            print_queue_contents(priority_queue)
            priority, data = priority_queue.get()
            num_queue_data -=1
            store_data_in_globals(data)
            
            position = tmp_position
            #딸기 위치로 이동
            gripper_x_pos = calculate_gripper_x_position(arm, x_center, cam_pos)
        else:
            #딸기 위치로 이동
            print("There's no distortion!")
            gripper_x_pos = calculate_gripper_x_position(arm, x_center, position)
        print( "gripper_x_pos = ", gripper_x_pos)
        time.sleep(1)
        arm.gripper_open()
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
        # 따고 원래 동작으로 하기
        if forward_or_reverse.strip() == "forward" or forward_or_reverse.strip() == "captureforward":
            arm.set_joint_angle(step_before_forward_target)
            time.sleep(1)
            arm.set_joint_angle(forward_initial_angle)
            time.sleep(1)
            
            if normal_or_abnormal == "abnormal":
                mqtt_client.publish(TOPIC, "spray")
                print("spray!!!!!!")
                time.sleep(3)

            if position == 400:
                arm.set_slider_posi(SLIDER_MAX)
                arm.set_joint_angle(before_store_angle_forward)
                time.sleep(1)
                arm.set_joint_angle(forward_store_angle)
                time.sleep(1)
                arm.gripper_open()
                time.sleep(1)
                arm.set_joint_angle(after_store_angle_forward)
                time.sleep(1)
                arm.set_joint_angle(forward_initial_angle)
                arm.gripper_close()
            elif position == 150:
                arm.set_slider_posi(SLIDER_MIN)
                arm.set_joint_angle(before_store_angle_reverse)
                time.sleep(1)
                arm.set_joint_angle(reverse_store_angle)
                time.sleep(1)
                arm.gripper_open()
                time.sleep(1)
                arm.set_joint_angle(after_store_angle_reverse)
                time.sleep(1)
                arm.set_joint_angle(forward_initial_angle)
                arm.gripper_close()
            #global 변수 초기화
            position = None
            forward_or_reverse = None
            normal_or_abnormal = None
            x_center = None
            y_center = None
            box_height = None
            received_position_forward = None  # 처리 후 값 초기화
            
            if priority_queue.empty():
                arm.set_slider_posi(SLIDER_MAX)
                rotate_robot_arm(arm, is_forward_direction)
                is_forward_direction=False
                break
            
            
        elif forward_or_reverse.strip() == "reverse" or forward_or_reverse.strip() == "capturereverse":
            arm.set_joint_angle(step_before_reverse_target)
            time.sleep(1)
            arm.set_joint_angle(reverse_initial_angle)
            time.sleep(1)
            if normal_or_abnormal == "abnormal":
                mqtt_client.publish(TOPIC, "spray")
                print("spray!!!!!!")
                time.sleep(3)
                print(position)

            if position == 400:
                arm.set_slider_posi(SLIDER_MAX)
                arm.set_joint_angle(before_store_angle_forward)
                time.sleep(1)
                arm.set_joint_angle(forward_store_angle)
                time.sleep(1)
                arm.gripper_open()
                time.sleep(1)
                arm.set_joint_angle(after_store_angle_forward)
                time.sleep(1)
                arm.set_joint_angle(reverse_initial_angle)
                arm.gripper_close()
            elif position == 150:
                arm.set_slider_posi(SLIDER_MIN)
                arm.set_joint_angle(before_store_angle_reverse)
                time.sleep(1)
                arm.set_joint_angle(reverse_store_angle)
                time.sleep(1)
                arm.gripper_open()
                time.sleep(1)
                arm.set_joint_angle(after_store_angle_reverse)
                time.sleep(1)
                arm.set_joint_angle(reverse_initial_angle)
                arm.gripper_close()
            #global 변수 초기화
            position = None
            normal_or_abnormal = None
            forward_or_reverse = None
            x_center = None
            y_center = None
            box_height = None
            received_position_forward = None  # 처리 후 값 초기화
            if priority_queue.empty():
                arm.set_slider_posi(SLIDER_MIN)
                rotate_robot_arm(arm, is_forward_direction)
                is_forward_direction=True
                break

            
# 큐의 내용을 출력하는 함수
def print_queue_contents(priority_queue):
    temp_queue = queue.PriorityQueue()
    
    print("Current queue contents:")
    
    # 큐의 모든 내용을 임시 큐에 옮기면서 출력
    while not priority_queue.empty():
        item = priority_queue.get()
        print(item)  # 큐의 요소 출력
        temp_queue.put(item)  # 임시 큐에 저장
    
    # 원래 큐로 데이터를 복원
    while not temp_queue.empty():
        priority_queue.put(temp_queue.get())


if __name__ == "__main__":
    # 로봇 팔 초기화
    initialize_robot_arm(arm)

    # MQTT 연결 설정
    mqtt_client = setup_mqtt()
    print("success connect broker!!")
 
    # 무한 반복 작업 실행
    while True:
        print("-----------\n operating message : ")
        print(operating_message)
        if operating_message == "ON":
            print("Operating message is ON, checking priority queue...")
            # forward 값이 있을 때 실행 (정방향)
            if not priority_queue.empty():
                print("=========================")
                harvest_berry()
            else:
                is_forward_direction = move_slider(arm, is_forward_direction)  # 슬라이더를 기본 동작(0mm에서 485mm 또는 485mm에서 0mm)으로 이동
                print(is_forward_direction)
        else:
            arm.set_slider_posi(0)
            arm.set_joint_angle(forward_initial_angle)
            is_forward_direction=True
            print("waiting for ON!")
            time.sleep(1)

        
     