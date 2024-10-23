from wlkata_mirobot import WlkataMirobot
import time

# 로봇 팔 객체 생성
arm = WlkataMirobot(portname='COM7', debug=True)

# 알람 해제 (idle 상태로 전환)
print("Unlocking all axes and clearing alarm...")
arm.unlock_all_axis()  # 모든 축의 알람을 해제하여 idle 상태로 복귀
time.sleep(2)  # 알람 해제 후 잠시 대기

# 슬라이더 끝점 정의
SLIDER_MAX = 485
SLIDER_MIN = 0


# 현재 방향 (True: 485로 이동 중, False: 0으로 이동 중)
forward_direction = True  # 처음에는 0에서 485로 이동
target_angles = {1:90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}
reverse_angles = {1:-90.0, 2:0.0, 3:0.0, 4:0.0, 5:0.0, 6:0.0}
def rotate_robot_arm():
    """로봇 팔의 몸통을 180도 회전""
    global forward_direction
    if forward_direction:
        print("Rotating robot arm to 180 degrees (facing opposite)...")
        arm.set_joint_angle(target_angles)  # 1번 관절을 180도 회전

    else:
        print("Rotating robot arm back to 0 degrees (facing forward)...")
        arm.set_joint_angle(reverse_angles)  # 1번 관절을 반대로 180도 회전

    # 상태 확인을 위한 대기 시간 추가
    time.sleep(2)

    # 로봇 팔의 현재 상태 확인
    status = arm.get_status()
    print(f"Current robot arm pose: {status.cartesian}")  # cartesian은 객체의 속성
    print(f"Yaw: {status.cartesian.yaw}")  # yaw 값 확인

def move_slider():
    """슬라이더를 이동시키는 함수"""
    global forward_direction

    if forward_direction:
        print(f"Moving slider to {SLIDER_MAX}mm position...")
        arm.set_slider_posi(SLIDER_MAX)  # 슬라이더를 485mm로 이동
        time.sleep(2)  # 슬라이더가 이동하는 동안 대기
        
        # 로봇 팔을 180도 회전
        rotate_robot_arm()
        
        # 잠시 대기
        print("Pausing at 485mm position...")
        time.sleep(2)

        # 방향을 반대로 변경 (485 -> 0으로 이동)
        forward_direction = False

    else:
        print(f"Moving slider to {SLIDER_MIN}mm position...")
        arm.set_slider_posi(SLIDER_MIN)  # 슬라이더를 0mm로 이동
        time.sleep(2)  # 슬라이더가 이동하는 동안 대기

        # 로봇 팔을 180도 회전
        rotate_robot_arm()

        # 잠시 대기
        print("Pausing at 0mm position...")
        time.sleep(2)

        # 방향을 다시 485로 변경
        forward_direction = True

# 무한 반복 작업 실행
while True:
    move_slider()  # 슬라이더를 이동시키고 로봇 팔을 회전시키는 동작을 반복
