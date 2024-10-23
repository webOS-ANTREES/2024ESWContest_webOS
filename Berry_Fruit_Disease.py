"""
 * Project : 제 22회 임베디드 SW 경진대회 딸기 병충해 판단 CNN 모델 생성
 * Program Purpose and Features :
 * - load Strawberries Image and Analysis
 * Author : HG Kim
 * First Write Date : 2024.08.01
 * ============================================================
 * Program history
 * ============================================================
 * Author    		Date		    Version		     History
   HG Kim           2024.08.01      CNN_Model.v1     모델 생성 및 테스트
   HG Kim           2024.08.01      CNN_Model.v2     train 데이터셋 업데이트
   HG Kim           2024.08.01      CNN_Model.v3     CNN 필터 크기 변경 및 에폭 변경
   HG Kim           2024.08.01      CNN_Model.v4     train 데이터셋 업데이트
   HG Kim           2024.08.01      CNN_Model.v5     train 데이터셋 업데이트
"""

import os
import numpy as np
import cv2 as cv
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, Activation, MaxPooling2D, Flatten, Dense
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping

import matplotlib.pyplot as plt

class CSAT:  # Comprehensive Strawberry Assessment Tool
    def __init__(self):
        # 데이터 경로
        self.DIR_CNN_MODELS = None # 추후에 경로 지정 해줘야함.
        self.DIR_RESULT = None # 추후에 경로 지정 해줘야함.
        self.IMG_SIZE = 150
        self.DIR_NORMAL = 'normal data 경로'
        self.DIR_ABNORMAL = 'abnormal data 경로'
        # 데이터 사이클
        # self.Cycles = ["fruit_normal","fruit_disease","leaf_normal","leaf_disease","flower_normal","flower_disease","stem_normal","stem_disease"]
        # self.States = ["normal","disease"]
        self.EPOCHS = 9 # 추후에 결정
        
    def print_log(self, message):
        print(message)
        
    # 지정된 경로에 Result, CNN_Model 디렉토리 생성 함수. 
    def create_directory(self, root_path):
        try:
            if not os.path.exists(root_path):
                os.makedirs(root_path)
                self.print_log(f"Directory created: {root_path}")
            if not os.path.exists(root_path + "/" + "Result"):
                os.makedirs(root_path + "/" + "Result")
                self.DIR_RESULT = root_path + "/" + "Result"
            if not os.path.exists(root_path + "/" + "CSAT_CNN_Model"):
                os.makedirs(root_path + "/" + "CSAT_CNN_Model")
                self.DIR_CNN_MODELS = root_path + "/" + "CSAT_CNN_Model"
            
        except OSError as e:
            self.print_log(f"Error creating directory {root_path}: {e}")
    
    # img_path에 있는 이미지를 불러오고 resize 한 후 numpy 배열 형태로 반환하는 함수.
    def load_and_preprocess_image(self, img_path, img_size):
        try:
            img_array = cv.imread(img_path)
            if img_array is None:
                raise ValueError("Image not found or unable to read")
            new_array = cv.resize(img_array, (img_size, img_size))
            return new_array
        except Exception as e:
            self.print_log(f"Error reading image {img_path}: {e}")
            return None
                
    def create_dataset(self):
        data = []
        labels = []

        for img in os.listdir(self.DIR_NORMAL):
            img_path = os.path.join(self.DIR_NORMAL, img)
            img_array = self.load_and_preprocess_image(img_path, self.IMG_SIZE)
            if img_array is not None:
                data.append(img_array)
                labels.append(0)  # Normal label

        for img in os.listdir(self.DIR_ABNORMAL):
            img_path = os.path.join(self.DIR_ABNORMAL, img)
            img_array = self.load_and_preprocess_image(img_path, self.IMG_SIZE)
            if img_array is not None:
                data.append(img_array)
                labels.append(1)  # Abnormal label

        data = np.array(data) / 255.0  # Normalize images
        # data리스트를 넘바이 배열로 변환 후 모든 요소를 255로 나누어 픽셀 값을 0 ~ 1 사이로 정규화
        labels = np.array(labels)

        self.print_log(f"Dataset created with {len(data)} samples.")

        # data와 labels의 20%를 testset, 80%를 dataset으로 사용, random_state를 통해 데이터를 나누는 방식이 매번 동일하도록 난 수 시드를 고정.
        return train_test_split(data, labels, test_size=0.2, random_state=42)
        
                    
                
    def gen_CNN_Models(self):
        self.print_log("Generating CNN model...")
        # 모델 생성
        model = Sequential([
            Conv2D(32, (3, 3), input_shape=(self.IMG_SIZE, self.IMG_SIZE, 3)),
            Activation('relu'),
            MaxPooling2D(pool_size=(2, 2)),
    
            Conv2D(64, (3, 3)),
            Activation('relu'),
            MaxPooling2D(pool_size=(2, 2)),
    
            Conv2D(128, (3, 3)),
            Activation('relu'),
            MaxPooling2D(pool_size=(2, 2)),
    
            Flatten(),
            Dense(512),
            Activation('relu'),
            Dense(1),  # 이진 분류를 위해 출력층을 1개로 설정
            Activation('sigmoid')  # 이진 분류에 적합한 sigmoid 활성화 함수 사용
        ])

        
        # 모델 컴파일
        model.compile(loss='binary_crossentropy',
                      optimizer='adam',
                      metrics=['accuracy'])
        
        self.print_log("Model generated and compiled.")

        return model
    
    def train_and_evaluate(self):
        # 1. 데이터셋 생성 및 분할:
        # create_dataset() -> 데이터셋을 생성하고 이를 학습용 데이터('x_train','y_train')와 테스트용 데이터('x_test','y_test')로 나누는 역활
        self.print_log("Starting dataset creation and splitting...")
        X_train, X_test, y_train, y_test = self.create_dataset()
        self.print_log(f"Dataset split into {len(X_train)} training and {len(X_test)} test samples.")
        
        # 2. 모델 생성:
        model = self.gen_CNN_Models()
        
        # 3. 조기 종료(Early Stopping) 설정:
        # EarlyStopping -> 학습이 일정 에폭 동안 개선되지 않으면 학습을 중단하는 콜백 함수.(overfitting 방지)
        # monitor='val_loss' -> 검증 손실을 모니터링. 검증 손실이 개선되지 않으면 학습을 중단.
        # patience=5 -> 손실이 개선되지 않는 연속 에폭 수를 5로 설정. 5 에폭동안 개선이 없으면 학습 중단.
        # restore_best_weights=True -> 학습을 중단하기 전에 얻어진 가장 좋은 모델 가중치를 복원.
        early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
        
        # 4. 모델 학습:
        self.print_log("Starting model training...")
        history = model.fit(X_train, y_train, epochs=self.EPOCHS, validation_split=0.2, callbacks=[early_stopping], verbose=1)
        self.print_log("Model training completed.")
        
        # 5. 모델 평가:
        self.print_log("Evaluating model on test data...")
        test_loss, test_accuracy = model.evaluate(X_test, y_test)
        
        print(f"Test Loss: {test_loss}")
        print(f"Test Accuracy: {test_accuracy}")
        
        return model, history
def main():
    desktop_path = 'C:/Users/mch2d/CSAT_Result/CSAT_CNN_Model'
    normal_data_path = 'D:/dataset_v2/Normal/fruit'
    abnormal_data_path = 'D:/dataset_v2/AbNormal/fruit'

    csat = CSAT()
    
    csat.DIR_NORMAL = normal_data_path
    csat.DIR_ABNORMAL = abnormal_data_path
    
    root_path = desktop_path
    csat.create_directory(root_path)
    
    # 디렉토리 경로 설정이 제대로 되었는지 확인
    if csat.DIR_CNN_MODELS is None:
        raise ValueError("DIR_CNN_MODELS is not set. Please check the directory creation process.")
    
    model, history = csat.train_and_evaluate()
    
    model_save_path = os.path.join(csat.DIR_CNN_MODELS, 'strawberry_cnn_model_v5.h5')
    model.save(model_save_path)
    csat.print_log(f"Model saved at {model_save_path}")
    
def test_single_image(image_path, model, csat):
    # 이미지 로드 및 전처리
    img = csat.load_and_preprocess_image(image_path, csat.IMG_SIZE)
    img = np.array(img) / 255.0  # 이미지 정규화
    img = np.expand_dims(img, axis=0)  # 배치 차원 추가

    # 예측
    prediction = model.predict(img)

     # 0 또는 1로 반환
    result = int(prediction > 0.5)

    # 예측 결과 출력
    print(f"Prediction (0: Normal, 1: Abnormal): {result}")

    return result
# 폴더 내 모든 이미지 테스트 함수
def test_folder_images(folder_path, model, csat):
    normal_count = 0
    abnormal_count = 0
    
    for filename in os.listdir(folder_path):
        if filename.endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(folder_path, filename)
            result = test_single_image(img_path, model, csat)
            
            if result == 0:
                normal_count += 1
            else:
                abnormal_count += 1
    # 최종 결과 로그 출력
    print(f"총 정상 이미지: {normal_count}개")
    print(f"총 비정상 이미지: {abnormal_count}개")
if __name__ == '__main__':
    #main()
    
    # CSAT 클래스 인스턴스 생성
    csat = CSAT()
    
    # 학습된 모델을 불러오기
    model_path = 'C:/Users/mch2d/CSAT_Result/CSAT_CNN_Model/strawberry_cnn_model_v4.h5'  # 저장된 모델 경로 설정
    model = load_model(model_path)
    
    # 테스트할 이미지 경로 설정
    #test_image_path = 'C:/Users/mch2d/Desktop/test_image16.jpg'
    #test_folder_path = 'D:/dataset_v2/Normal/fruit_1400' #정상폴더
    test_folder_path = 'D:/testset' #비정상폴더
    
    test_folder_images(test_folder_path,model,csat)
    # 이미지 테스트 실행
    #test_single_image(test_image_path, model, csat)
    
    # 정상 비정상 비율 2000:1600
    # v1 버전 -> 정상폴더 인식률 정상이미지:1089 비정상 이미지:77
    #          비정상폴더 인식률 정상이미지:213  비정상 이미지:362

    # 정상 비정상 비율 2000:1610
    # v2 버전 -> 정상폴더 인식률 정상이미지:1071 비정상 이미지:95
    #          비정상폴더 인식률 정상이미지:259  비정상 이미지:316

    # 정상 비정상 비율 2000:10000
    # v3 버전 -> 정상폴더 인식률 정상이미지:1095 비정상 이미지:71
    #          비정상폴더 인식률 정상이미지:1    비정상 이미지:574

    # 정상 비정상 비율 5000:10000
    # v4 버전 -> 정상폴더 인식률 정상이미지:1125 비정상 이미지:41
    #          비정상폴더 인식률 정상이미지:2    비정상 이미지:573

    # 정상 비정상 비율 10000:10000 (정상을 rotate하여 2배로 만듦)
    # v5 버전 -> 정상폴더 인식률 정상이미지:636 비정상 이미지:530
    #          비정상폴더 인식률 정상이미지:7    비정상 이미지:568
    
