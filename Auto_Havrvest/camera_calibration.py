import numpy as np
import cv2 as cv
import glob

# 종료 조건 설정: epsilon 또는 최대 반복 횟수(30)에 도달하면 알고리즘을 종료
criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 30, 0.001)

# 체커보드의 3D 공간 상의 좌표 준비
# 예: (0,0,0), (1,0,0), (2,0,0), ..., (6,5,0)
objp = np.zeros((6*8, 3), np.float32)
objp[:, :2] = np.mgrid[0:8, 0:6].T.reshape(-1, 2)

# 모든 이미지에서 객체 좌표와 이미지 좌표를 저장할 배열
objpoints = []  # 실제 3D 공간에서의 점들
imgpoints = []  # 이미지 평면에서의 2D 점들

# 현재 디렉토리에 있는 모든 jpg 이미지를 가져옴
images = glob.glob('C:/Users/IT/Desktop/cv/calibration*.jpg')

# 각 이미지를 순회하면서 처리
for fname in images:
    # 이미지를 읽고 그레이스케일로 변환
    img = cv.imread(fname)
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

    # 체커보드 코너를 찾음
    ret, corners = cv.findChessboardCorners(gray, (8, 6), None)

    # 코너를 찾았다면, 객체 좌표와 이미지 좌표를 추가
    if ret == True:
        objpoints.append(objp)  # 객체 좌표 추가
        # 코너 위치를 더 정밀하게 조정
        corners2 = cv.cornerSubPix(gray, corners, (11,11), (-1,-1), criteria)
        imgpoints.append(corners2)  # 이미지 좌표 추가

        # 체커보드 코너를 이미지에 그려서 표시
        cv.drawChessboardCorners(img, (8, 6), corners2, ret)
        cv.imshow('img', img)  # 이미지를 창에 표시
        cv.waitKey(1000)  # 1초 동안 대기

cv.destroyAllWindows()  # 모든 창 닫기

# 카메라 캘리브레이션 수행
ret, mtx, dist, rvecs, tvecs = cv.calibrateCamera(objpoints, imgpoints, gray.shape[::-1], None, None)

# 결과 출력
print("카메라 캘리브레이션 결과:")
print("1. 카메라 매트릭스 (Camera Matrix):")
print(mtx)

print("\n2. 왜곡 계수 (Distortion Coefficients):")
print(dist)

print("\n3. 회전 벡터 (Rotation Vectors):")
for i, rvec in enumerate(rvecs):
    print(f"  회전 벡터 {i+1}:")
    print(rvec)

print("\n4. 변환 벡터 (Translation Vectors):")
for i, tvec in enumerate(tvecs):
    print(f"  변혼 벡터 {i+1}:")
    print(tvec)
