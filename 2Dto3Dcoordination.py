import cv2
import numpy as np

# 카메라 캘리브레이션 결과 (예시 카메라 매트릭스와 왜곡 계수)
camera_matrix = np.array([[1124.039890, 0, 670.897286],
                          [0, 1127.715830, 350.888588],
                          [0, 0, 1]])

dist_coeffs = np.array([[-0.24810294,  0.09885776,  0.01736815,  0.00164588 , 0.21101177]])

# 회전 벡터와 이동 벡터 (캘리브레이션으로 구한 값, 예시)
rvec = np.array([[0.51916232], [-0.04553068], [ 0.01944088]])  # 회전 벡터
tvec = np.array([[-3.79837333], [-0.57424653], [ 7.01761059]])  # 이동 벡터

# YOLO 등으로 얻은 이미지 상의 2D 좌표 (예: 바운딩 박스 중심 좌표)
image_point = np.array([[500, 400]], dtype=np.float32)

# 고정된 깊이 값 (z 값, 단위: cm)
z_fixed = 5  # 고정된 깊이 값 (5cm)

# 1. 이미지 좌표를 왜곡 보정 (왜곡 제거)
undistorted_points = cv2.undistortPoints(np.expand_dims(image_point,     axis=1), camera_matrix, dist_coeffs)
print(f"왜곡 보정된 좌표: {undistorted_points}")

# 2. 2D 좌표에서 카메라 좌표로 변환 (z 값을 사용하여 3D 좌표 계산)
# 보정된 좌표와 고정된 z 값을 사용해 3D 카메라 좌표로 변환
camera_coords = np.array([[undistorted_points[0][0][0] * z_fixed,
                           undistorted_points[0][0][1] * z_fixed,
                           z_fixed]])

# 3. 카메라 좌표계를 실세계 좌표계로 변환
# 회전 벡터와 이동 벡터를 사용해 카메라 좌표에서 실세계 좌표로 변환
rotation_matrix, _ = cv2.Rodrigues(rvec)  # 회전 벡터를 회전 행렬로 변환
world_coords = np.dot(rotation_matrix, camera_coords.T).T + tvec.T

# 결과 출력
print(f"실세계 좌표 (x, y, z): {world_coords.flatten()}")
