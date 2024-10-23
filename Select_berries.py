"""
 * Project : 제 22회 임베디드 소프트웨어 경진대회 - 딸기 열매 객체 탐색 알고리즘 구현
 * Program Purpose and Features :
 * - 객체 탐색 알고리즘 데이터 준비를 위한 코드
 * Author : HG Kim
 * First Write Date : 2024.09.03
 * ============================================================
 * Program history
 * ============================================================
 * Author    		Date		    Version		        History
    HG Kim          2024.09.10
"""
import os
import cv2
import matplotlib.pyplot as plt
import shutil

# 초기 박스 크기 설정
BOX_SIZE = 50
clicks = []  # 클릭 좌표와 박스 크기를 저장하는 리스트

# 입력 폴더와 출력 폴더 경로 설정
input_folder = 'E:/straw berry data/archive/images'  # 딸기 사진이 모여 있는 폴더
output_folder = 'E:/straw berry data/Object_Detective_Data'  # 완성된 이미지와 라벨이 저장될 폴더
os.makedirs(output_folder, exist_ok=True)

# 클릭 이벤트 처리 함수
def on_click(event):
    global clicks, image, BOX_SIZE
    
    if event.xdata is not None and event.ydata is not None:
        x, y = int(event.xdata), int(event.ydata)
        # 클릭 좌표와 현재 박스 크기를 함께 저장
        clicks.append((x, y, BOX_SIZE))

        # 클릭한 좌표 출력 (디버깅용)
        print(f"Clicked at: {x}, {y} with box size {BOX_SIZE}")

        # 클릭한 좌표에 사각형 그리기
        draw_rectangle(x, y, BOX_SIZE)

        # 바운딩 박스 좌표 저장
        save_bounding_box(x, y, image.shape[1], image.shape[0], BOX_SIZE, current_image_name)

# 박스 크기 조정 및 뒤로가기 기능
def on_key(event):
    global BOX_SIZE, clicks, image, current_image_name
    if event.key == '+':
        BOX_SIZE += 10  # '+' 키로 박스 크기 증가
        print(f"Box size increased to {BOX_SIZE}")
    elif event.key == '-':
        if BOX_SIZE > 10:
            BOX_SIZE -= 10  # '-' 키로 박스 크기 감소
            print(f"Box size decreased to {BOX_SIZE}")
    elif event.key == 'backspace':
        if clicks:
            # 마지막 클릭 삭제
            last_click = clicks.pop()  
            print(f"Last click removed: {last_click}")
            
            # 텍스트 파일에서 마지막 줄 삭제
            remove_last_bounding_box(current_image_name)
            
            # 이미지를 다시 그림
            redraw_image()

# 사각형 다시 그리기
def redraw_image():
    global image
    image = cv2.imread(image_path)  # 이미지 다시 불러오기
    
    for (x, y, box_size) in clicks:
        draw_rectangle(x, y, box_size)  # 남은 클릭들에 대해 저장된 크기로 박스 다시 그림
    
    plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    plt.draw()

# 텍스트 파일에서 마지막 줄 삭제 함수
def remove_last_bounding_box(image_name):
    label_file = os.path.join(output_folder, os.path.splitext(image_name)[0] + '.txt')
    
    if os.path.exists(label_file):
        with open(label_file, 'r') as file:
            lines = file.readlines()
        
        # 마지막 줄을 제외한 나머지 내용만 다시 저장
        with open(label_file, 'w') as file:
            file.writelines(lines[:-1])
        
        print(f"Last bounding box removed from {label_file}")

# 사각형 그리기 함수 (박스 크기를 인자로 받음)
def draw_rectangle(x, y, box_size):
    # 빨간색: BGR 형식으로 (0, 0, 255)
    cv2.rectangle(image, (x - box_size // 2, y - box_size // 2), 
                  (x + box_size // 2, y + box_size // 2), (0, 0, 255), 2)
    plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    plt.draw()

# 바운딩 박스 저장 (박스 크기를 인자로 받음)
def save_bounding_box(x, y, img_width, img_height, box_size, image_name):
    x_center = x / img_width
    y_center = y / img_height
    width = box_size / img_width
    height = box_size / img_height

    label_file = os.path.join(output_folder, os.path.splitext(image_name)[0] + '.txt')
    print(f"Saving label to: {label_file}")

    with open(label_file, 'a') as f:
        f.write(f"0 {x_center} {y_center} {width} {height}\n")

    print(f"Saved bounding box: 0 {x_center} {y_center} {width} {height}")

# 이미지 저장 (박스가 그려진 상태로)
def save_image_with_boxes(image_name):
    save_image_path = os.path.join(output_folder, image_name)
    cv2.imwrite(save_image_path, image)  # 수정된 이미지를 저장
    print(f"Image with boxes saved to {save_image_path}")

# 폴더에서 이미지 불러오기
image_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

for current_image_name in image_files:
    image_path = os.path.join(input_folder, current_image_name)
    image = cv2.imread(image_path)

    if image is None:
        print(f"Error: {current_image_name} 파일을 불러올 수 없습니다.")
        continue

    fig, ax = plt.subplots()
    ax.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    # 클릭 및 키보드 이벤트 연결
    cid_click = fig.canvas.mpl_connect('button_press_event', on_click)
    cid_key = fig.canvas.mpl_connect('key_press_event', on_key)

    plt.show()

    # 박스가 그려진 이미지 저장
    save_image_with_boxes(current_image_name)

    # 클릭 좌표 초기화
    clicks.clear()

    # 작업이 끝난 이미지를 출력 폴더로 이동
    shutil.move(image_path, os.path.join(output_folder, current_image_name))

print("모든 이미지 처리 완료")
