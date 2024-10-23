"""
 * Project : 제 22회 임베디드 소프트웨어 경진대회 - 딸기 열매 객체 탐색 알고리즘 구현
 * Program Purpose and Features :
 * - load testset and Predict labels
 * Author : HG Kim
 * First Write Date : 2024.09.03
 * ============================================================
 * Program history
 * ============================================================
 * Author    		Date		    Version		        History
    HG Kim          2024.09.03      Model_with_Yolo.v1  모델 생성해봄.
    HG Kim          2024.09.18      Model_with_Yolo.v2  roboflow를 통한 모델 성능 향상
"""

import torch
import os
from pathlib import Path
from PIL import Image

# 학습된 모델 로드
model_path = 'C:/Users/antl/yolov5/runs/train/exp6/weights/best.pt'
model = torch.hub.load('C:/Users/antl/yolov5', 'custom', path=model_path, source='local')

# 폴더 내 모든 이미지를 테스트
folder_path = 'C:/Users/antl/SW_22th_contest/Object_Detective_Data/raw_data'
images = [os.path.join(folder_path, file) for file in os.listdir(folder_path) if file.endswith(('.png', '.jpg'))]

# 결과 저장할 폴더
save_path = 'C:/Users/antl/SW_22th_contest/Object_Detective_Data/detected_strawberries'
# 바운딩 박스 정보를 저장할 텍스트 파일 경로
bbox_save_path = 'C:/Users/antl/SW_22th_contest/Object_Detective_Data/bbox_info.txt'

# 결과 폴더가 없다면 생성
Path(save_path).mkdir(parents=True, exist_ok=True)

image_count = 0  # 처리된 이미지 수 카운터

# 텍스트 파일 준비
with open(bbox_save_path, 'w') as bbox_file:
    bbox_file.write("image_path,x1,y1,x2,y2,confidence,class_id\n")

    for img_path in images:
        # 추론 실행
        results = model(img_path)
        results.render()  # 결과 이미지에 탐지 박스와 라벨을 렌더링

        # 탐지된 객체들의 정보를 텍스트 파일에 기록
        for det in results.xyxy[0]:  # 결과의 바운딩 박스를 순회
            x1, y1, x2, y2 = map(int, det[:4])  # 바운딩 박스 좌표를 정수로 변환
            conf = float(det[4])                # 신뢰도를 실수로 변환
            cls_id = int(det[5])                # 클래스 ID를 정수로 변환

            if cls_id == 0:  # 딸기 클래스 (1) 만 처리
                bbox_file.write(f"{img_path},{x1},{y1},{x2},{y2},{conf},{cls_id}\n")
                # 이미지 자르기 및 저장
                img = Image.open(img_path).crop((x1, y1, x2, y2))
                save_file_name = f"strawberry_{x1}_{y1}_{os.path.basename(img_path)}"
                save_file_path = os.path.join(save_path, save_file_name)
                img.save(save_file_path)
                print(f"Saved cropped strawberry image at: {save_file_path}")
        
        image_count += 1  # 이미지 처리 수 증가

print(f"All images processed: {image_count} images processed and saved.")
