"""
 * Project : 제 22회 임베디드 소프트웨어 경진대회 - 딸기 열매 객체 탐색 알고리즘 구현 및 딸기 열매 익음 정도 판단 구현
 * Program Purpose and Features :
 * - load testset and Predict labels with Yolov5
 * Author : HG Kim
 * First Write Date : 2024.09.03
 * ============================================================
 * Program history
 * ============================================================
 * Author    		Date		    Version		            History
    HG Kim          2024.09.03      Model_with_Yolo.v1      모델 생성해봄.
    HG Kim          2024.09.18      Model_with_Yolo.v2      roboflow를 통한 모델 성능 향상
    HG Kim          2024.09.19      Model_with_Yolo.v3      dataset 업데이트
    HG Kim          2024.09.19      Model_with_Yolo.v4      yolov5를 통해서 딸기 객체 탐색과 열매 익음정도를 같이 학습시킨 후 해당 모델을 통해 한번에 판단.(익음,안익음 판단 GOOD, But 잎과 줄기를 딸기로 인식하는 확률 올라감)
    HG Kim          2024.09.21      Model_with_Yolo.v5      딸기 열매 뿐만이 아닌 줄기까지 학습을 시킴으로써 열매 인식률 높이고 줄기를 열매로 인식하는 확률 줄임.
    HG Kim          2024.09.30      Model_with_Yolo.v6      딸기의 병해충 판독도 학습시켜 한번에 진행
    HG Kim          2024.10.13      Model_with_Yolo.v7      딸기의 병해충 판독 성능 올리고 전체 틀 잡음
"""
import torch
import os
from pathlib import Path
import cv2
import shutil
import paho.mqtt.client as mqtt
import time

#BROKER_ADDRESS = "172.20.48.180"  # MQTT 브로커 주소
#BROKER_ADDRESS = "165.229.185.243"
#BROKER_ADDRESS="192.168.50.248"
# 태우 노트북 핫스팟
BROKER_ADDRESS = "192.168.137.147"
#대장 핫스팟
# BROKER_ADDRESS = "192.0.0.2"
TOPIC = "robot/location"  # 위치 값을 받을 토픽

# MQTT 설정 함수
def setup_mqtt():
    client = mqtt.Client()
    client.connect(BROKER_ADDRESS)
    client.subscribe(TOPIC)
    client.loop_start()  # 백그라운드에서 MQTT 메시지 수신 시작
    return client

def load_model(model_path, model_source='local'):
    """
    YOLOv5 모델을 불러옵니다.
    :param model_path: 학습된 모델의 경로.
    :param model_source: 모델의 출처 (기본값은 'local').
    :return: 불러온 YOLOv5 모델.
    """
    return torch.hub.load('/Users/hyeonggeun_kim/yolov5', 'custom', path=model_path, source=model_source)

def save_detection_labels(detections, img_path, labels_save_path):
    """
    탐지된 객체에 대한 라벨(바운딩 박스 좌표, 클래스, 신뢰도)을 텍스트 파일로 저장합니다.
    :param detections: 모델로부터 탐지된 객체들.
    :param img_path: 처리된 이미지의 경로.
    :param labels_save_path: 탐지된 라벨 파일을 저장할 경로.
    """
    label_file_path = os.path.join(labels_save_path, os.path.basename(img_path).replace('.jpg', '.txt').replace('.png', '.txt'))
    
    with open(label_file_path, 'w') as label_file:
        for detection in detections:
            x1, y1, x2, y2, conf, cls = detection  # 바운딩 박스 좌표, 신뢰도, 클래스
            # YOLO 형식으로 저장: 클래스 중심 좌표 x_center, y_center 너비 width, 높이 height, 신뢰도 confidence
            bbox_width = x2 - x1
            bbox_height = y2 - y1
            x_center = x1 + bbox_width / 2
            y_center = y1 + bbox_height / 2
            
            label_file.write(f"{int(cls)} {x_center:.4f} {y_center:.4f} {bbox_width:.4f} {bbox_height:.4f} {conf:.2f}\n")
    
    print(f"라벨이 {label_file_path}에 저장되었습니다.")

def process_images(model, folder_path, save_path, classes_to_filter=(0, 1, 3)):
    """
    폴더에 있는 모든 이미지에서 객체 탐지를 실행하고, 결과를 바운딩 박스와 함께 저장하며, 결과 정보를 텍스트 파일에 저장합니다.
    또한 원본 이미지를 저장합니다.
    :param model: YOLOv5 모델.
    :param folder_path: 이미지가 저장된 폴더의 경로.
    :param save_path: 결과가 저장될 폴더의 경로.
    :param classes_to_filter: 필터링할 클래스 ID들의 튜플 (기본값은 (0, 1, 3)로, 익은 딸기, 안 익은 딸기, 병충해를 의미).
    """
    # 이미지를 저장할 경로, 라벨을 저장할 경로, 원본 데이터를 저장할 경로 정의
    images_save_path = os.path.join(save_path, 'images')
    labels_save_path = os.path.join(save_path, 'labels')
    raw_data_save_path = os.path.join(save_path, 'raw_data')

    # 저장 디렉토리가 존재하지 않으면 생성
    Path(images_save_path).mkdir(parents=True, exist_ok=True)
    Path(labels_save_path).mkdir(parents=True, exist_ok=True)
    Path(raw_data_save_path).mkdir(parents=True, exist_ok=True)

    # 폴더에서 모든 이미지 파일 가져오기
    images = [os.path.join(folder_path, file) for file in os.listdir(folder_path) if file.endswith(('.png', '.jpg'))]
    
    # 전체 개수 및 각 클래스별 개수를 추적할 변수
    total_strawberry_count = 0
    total_pest_count = 0
    total_ripe_count = 0  # 익은 딸기 개수
    total_unripe_count = 0  # 안 익은 딸기 개수

    for img_path in images:
        # 추론 수행
        results = model(img_path)
        
        # 탐지 결과 추출
        detections = results.xyxy[0]
        
        # 전체 딸기 개수 계산 (익은 딸기, 안 익은 딸기, 병충해 전부 포함)
        total_strawberry_count += len(detections)

        # 병충해가 있는지 먼저 확인하여 모든 탐지에서 병충해만 우선 처리
        pest_detected = any(detections[:, 5] == 3)

        # 병충해가 있으면 병충해로만 처리하고, 익은/안 익은 딸기로 처리하지 않음
        if pest_detected:
            # 병충해로만 카운트
            pest_count = sum(detections[:, 5] == 3)
            total_pest_count += pest_count
        else:
            # 병충해가 없을 때만 익은 딸기 및 안 익은 딸기를 카운트
            ripe_count = sum(detections[:, 5] == 0)
            unripe_count = sum(detections[:, 5] == 1)
            total_ripe_count += ripe_count
            total_unripe_count += unripe_count

        # 원본 이미지 로드
        img = cv2.imread(img_path)

        # 필터링된 객체에 바운딩 박스 그리기
        for detection in detections:
            x1, y1, x2, y2, conf, cls = detection  # 바운딩 박스 좌표, 신뢰도, 클래스
            
            # 병충해가 있는 경우 그 열매는 병충해로만 처리
            if int(cls) == 3:
                color = (0, 255, 0)  # 병충해는 초록색
                label = f'pest: {conf:.2f}'
            elif int(cls) == 0 and not pest_detected:
                color = (255, 0, 0)  # 익은 딸기는 파란색
                label = f'ripe: {conf:.2f}'
            elif int(cls) == 1 and not pest_detected:
                color = (0, 0, 255)  # 안 익은 딸기는 빨간색
                label = f'unripe: {conf:.2f}'
            else:
                continue  # 병충해가 있으면 익은/안 익은 딸기 처리 생략

            # 바운딩 박스와 라벨 그리기
            cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            cv2.putText(img, label, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

        # 결과 이미지를 'images' 폴더에 저장
        save_file_path = os.path.join(images_save_path, os.path.basename(img_path))
        cv2.imwrite(save_file_path, img)

        # 탐지된 라벨을 텍스트 파일로 'labels' 폴더에 저장
        save_detection_labels(detections, img_path, labels_save_path)

        # 원본 이미지를 'raw_data' 폴더에 저장
        raw_image_save_path = os.path.join(raw_data_save_path, os.path.basename(img_path))
        shutil.copy(img_path, raw_image_save_path)  # 원본 이미지 복사
        if os.path.exists(raw_image_save_path):  # 복사가 성공했는지 확인
            os.remove(img_path)
        print(f"원본 이미지가 {raw_image_save_path}에 저장되었습니다.")

        # 처리 상태 및 병충해 개수 출력
        print(f"{img_path} 처리가 완료되어 {save_file_path}에 저장되었습니다.")
        if pest_detected:
            print(f"{img_path}에서 병충해 개수: {pest_count}개 발견")
        else:
            print(f"{img_path}에서 익은 딸기: {ripe_count}개, 안 익은 딸기: {unripe_count}개 발견")

        # 최종 결과 출력
    print("\n=== 최종 결과 ===")
    print(f"전체 딸기 열매 개수: {total_strawberry_count}개")
    print(f"익은 딸기 열매 개수: {total_ripe_count}개")
    print(f"안 익은 딸기 열매 개수: {total_unripe_count}개")
    print(f"병충해 걸린 열매 개수: {total_pest_count}개")


def capture_bounding_boxes(Object_Detection_Result_Folder):
    """
    라벨 파일을 읽고, 해당 바운딩 박스 좌표에 맞춰 이미지를 잘라내어 익은 딸기, 안 익은 딸기, 병해충 딸기로 분류하여 저장합니다.
    :param Object_Detection_Result_Folder: 라벨과 이미지를 포함한 폴더 경로.
    """
    
    images_folder = os.path.join(Object_Detection_Result_Folder, 'raw_data')
    labels_folder = os.path.join(Object_Detection_Result_Folder, 'labels')
    ripe_folder = os.path.join(Object_Detection_Result_Folder, 'captured_ripe_berry')
    unripe_folder = os.path.join(Object_Detection_Result_Folder, 'captured_unripe_berry')
    diseased_folder = os.path.join(Object_Detection_Result_Folder, 'captured_diseased_berry')

    # 폴더가 없으면 생성
    os.makedirs(ripe_folder, exist_ok=True)
    os.makedirs(unripe_folder, exist_ok=True)
    os.makedirs(diseased_folder, exist_ok=True)

    for label_file in os.listdir(labels_folder):
        if label_file.endswith('.txt'):
            # 라벨 파일 경로
            label_path = os.path.join(labels_folder, label_file)

            # 이미지 파일 이름 가져오기 (.jpg 또는 .png)
            image_file_jpg = label_file.replace('.txt', '.jpg')
            image_file_png = label_file.replace('.txt', '.png')

            image_path = os.path.join(images_folder, image_file_jpg)  # 기본적으로 .jpg를 시도
            if not os.path.exists(image_path):  # .jpg가 없으면 .png로 시도
                image_path = os.path.join(images_folder, image_file_png)

            # 이미지 읽기
            image = cv2.imread(image_path)
            if image is None:
                print(f"Warning: {image_path} 이미지를 불러올 수 없습니다.")
                continue
            
            # 이미지 이름에서 번호와 방향 추출
            image_name_parts = os.path.basename(image_path).split('_')
            if len(image_name_parts) >= 2:
                position = image_name_parts[0]  # 150 부분
                forward_or_reverse = image_name_parts[1]  # forward 부분

            # 이미지 크기 가져오기
            img_height, img_width, _ = image.shape
            print(f"이미지 크기: {img_width}x{img_height}")

            # 라벨 파일 읽기 및 업데이트 준비
            updated_lines = []
            with open(label_path, 'r') as file:
                lines = file.readlines()
                for idx, line in enumerate(lines):
                    parts = line.strip().split()
                    if len(parts) < 5:
                        continue

                    label_class = int(parts[0])  # 클래스 값 (0, 1 또는 3)
                    x_center = float(parts[1])
                    y_center = float(parts[2]) 
                    box_width = float(parts[3])
                    box_height = float(parts[4]) 

                    # 바운딩 박스 좌표 계산
                    x_min = int(x_center - box_width / 2)
                    y_min = int(y_center - box_height / 2)
                    x_max = int(x_center + box_width / 2)
                    y_max = int(y_center + box_height / 2)

                    # 바운딩 박스 좌표와 크기 확인
                    print(f"바운딩 박스 좌표: x_min={x_min}, y_min={y_min}, x_max={x_max}, y_max={y_max}")
                    print(f"바운딩 박스 크기: 너비={x_max - x_min}, 높이={y_max - y_min}")

                    # 바운딩 박스가 이미지 범위를 벗어나지 않도록 제한
                    x_min = max(0, x_min)
                    y_min = max(0, y_min)
                    x_max = min(img_width, x_max)
                    y_max = min(img_height, y_max)

                    # 자를 영역의 크기가 유효한지 확인
                    if x_max - x_min > 0 and y_max - y_min > 0:
                        # 바운딩 박스 영역 잘라내기
                        cropped_image = image[y_min:y_max, x_min:x_max]

                        # 저장 경로 설정
                        if label_class == 0:
                            output_folder = ripe_folder
                            is_disease = "normal"
                            mqtt_client.publish(TOPIC,"{}, {}, {}, {}, {}, {}".format(position, forward_or_reverse, is_disease, x_center,y_center,y_max-y_min))
                            print("print_normal")
                            # 클래스 0을 7로 변경
                            label_class = 7
                        elif label_class == 1:
                            output_folder = unripe_folder
                            # 클래스 0을 7로 변경
                            label_class = 5
                        elif label_class == 3:
                            output_folder = diseased_folder
                            is_disease = "abnormal"
                            mqtt_client.publish(TOPIC,"{}, {}, {}, {}, {}, {}".format(position, forward_or_reverse, is_disease, x_center,y_center,y_max-y_min))
                            print("print_abnormal")
                            # 클래스 0을 7로 변경
                            label_class = 6
                        else:
                            # label_class가 0, 1, 3이 아닌 경우 처리
                            continue  # 처리하지 않고 다음 라벨로 넘어감
                        # 잘라낸 이미지를 저장 (파일명은 원본 이미지 이름 + 번호로 저장)
                        output_path = os.path.join(output_folder, f"{label_file.replace('.txt', '')}_crop_{idx}.png")
                        cv2.imwrite(output_path, cropped_image)
                        print(f"잘라낸 이미지 저장됨: {output_path}")

                    # 클래스가 0인 경우 7로 변경한 뒤 다시 저장할 수 있도록 업데이트
                    updated_line = f"{label_class} {x_center} {y_center} {box_width} {box_height}\n"
                    updated_lines.append(updated_line)

            # 수정된 라벨 파일 다시 저장
            with open(label_path, 'w') as file:
                file.writelines(updated_lines)

            print(f"라벨 파일이 수정됨: {label_path}")

# Example usage
if __name__ == "__main__":
    model_path = '/Users/hyeonggeun_kim/yolov5/runs/train/exp/weights/best.pt'
    folder_path = '/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/collect_images'
    berry_folder_path = '/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/processed_images/captured_ripe_berry'
    save_path = '/Users/hyeonggeun_kim/Documents/22th_sw_contest/Object_Detection/processed_images'

    mqtt_client = setup_mqtt()
    model = load_model(model_path)
    
    while True:    
        # 폴더에 있는 파일들 중 숨김 파일 제외
        files = [f for f in os.listdir(folder_path) if not f.startswith('.')]
        print(f"폴더에 있는 파일들: {files}")  # 필터링된 파일 리스트 출력
        
        # 폴더가 비어 있는지 확인 (파일이 없으면 실행)
        if len(files) == 0:
            print("폴더가 비어있습니다. 대기 중...")
        else:
            print("폴더에 파일이 존재합니다. 작업을 시작합니다.")
    
            # 통신 받은 내용이 있으면 실행할 작업
            process_images(model, folder_path, save_path)
            capture_bounding_boxes(save_path)
        
        time.sleep(2)