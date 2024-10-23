"""
 * Project : 제 22회 임베디드 SW 경진대회 딸기 열매 익음 정도 판단 
 * Program Purpose and Features :
 * - load Strawberries Image and Analysis
 * Author : HG Kim
 * First Write Date : 2024.09.12
 * ============================================================
 * Program history
 * ============================================================
 * Author    		Date		    Version		History
   HG Kim           2024.09.12      v1          모델 생성 및 테스트
   HG Kim           2024.09.13      v2          train 데이터셋 업데이트
"""

import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import numpy as np

def train_and_save_model(train_dir, validation_dir, save_model_path):
    # 이미지 데이터 전처리 (ImageDataGenerator를 통해 데이터 증강 적용)
    train_datagen = ImageDataGenerator(
        rescale=1.0/255,
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    validation_datagen = ImageDataGenerator(rescale=1.0/255)

    # 데이터 로딩
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(150, 150),
        batch_size=32,
        class_mode='binary'
    )

    validation_generator = validation_datagen.flow_from_directory(
        validation_dir,
        target_size=(150, 150),
        batch_size=32,
        class_mode='binary'
    )

    # CNN 모델 정의
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
        MaxPooling2D(2, 2),
        
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(1, activation='sigmoid')  # 이진 분류 (익은 딸기 vs 안 익은 딸기)
    ])

    # 모델 컴파일
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='binary_crossentropy',
                  metrics=['accuracy'])

    # 모델 학습
    history = model.fit(
        train_generator,
        steps_per_epoch=100,  # 한 epoch당 학습할 스텝 수 (학습 데이터셋 크기에 맞게 설정)
        epochs=30,  # 에포크 수
        validation_data=validation_generator,
        validation_steps=50  # 검증 데이터셋 크기에 맞게 설정
    )

    # 모델 저장
    model.save(save_model_path)

    # 모델 평가
    loss, accuracy = model.evaluate(validation_generator)
    print(f'Validation Accuracy: {accuracy*100:.2f}%')

def load_and_test_model(model_path, test_dir):
    # 모델 불러오기
    model = tf.keras.models.load_model(model_path)

    # 이미지 전처리 및 불러오기
    test_datagen = ImageDataGenerator(rescale=1.0/255)

    # flow_from_directory를 사용하여 테스트 이미지 로드
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=(150, 150),
        batch_size=32,
        class_mode=None,  # class_mode를 None으로 설정하여 레이블 없이 이미지만 가져옴
        shuffle=False  # 예측 순서를 유지하기 위해 셔플을 하지 않음
    )

    # 모델을 사용해 예측 수행
    predictions = model.predict(test_generator)

    # 예측 결과 해석
    for i, prediction in enumerate(predictions):
        if prediction > 0.5:
            print(f"이미지 {test_generator.filenames[i]}: 익은 딸기로 분류되었습니다.")
        else:
            print(f"이미지 {test_generator.filenames[i]}: 안 익은 딸기로 분류되었습니다.")

if __name__ == "__main__":
    # 학습 데이터 및 모델 저장 경로 설정
    train_dir = 'C:/Users/antl/Desktop/berry riped data/test'
    validation_dir = 'C:/Users/antl/Desktop/berry riped data/validation'
    save_model_path = 'C:/Users/antl/SW_22th_contest/model/fruit_ripeness_assessment_model/strawberry_classifier.h5'

    # 모델 학습 및 저장 함수 호출
    #train_and_save_model(train_dir, validation_dir, save_model_path)

    # 모델 테스트할 이미지 경로 설정
    test_dir = 'C:/Users/antl/Desktop/berry riped data/test'

    # 모델 로드 및 테스트 함수 호출
    load_and_test_model(save_model_path, test_dir)

"""
이미지 abnormal\832216_20211115_1_0_0_1_2_13_0_2_rotate.jpg: 안 익은 딸기로 분류되었습니다.     
이미지 abnormal\832217_20211115_1_0_0_1_2_13_0_3.jpg: 안 익은 딸기로 분류되었습니다.
이미지 abnormal\832217_20211115_1_0_0_1_2_13_0_3_rotate.jpg: 안 익은 딸기로 분류되었습니다.     
이미지 abnormal\894593_20211103_1_0_0_1_2_13_0_12.jpg: 안 익은 딸기로 분류되었습니다.
이미지 abnormal\894594_20211103_1_0_0_1_2_13_0_13.jpg: 안 익은 딸기로 분류되었습니다.
이미지 abnormal\894594_20211103_1_0_0_1_2_13_0_13_rotate.jpg: 안 익은 딸기로 분류되었습니다.    
이미지 internet_data\1.png: 익은 딸기로 분류되었습니다.
이미지 internet_data\2.png: 익은 딸기로 분류되었습니다.
이미지 internet_data\3.png: 안 익은 딸기로 분류되었습니다.
이미지 internet_data\4.png: 안 익은 딸기로 분류되었습니다.
이미지 normal\832260_20211115_1_0_0_1_2_13_0_46_rotate.jpg: 익은 딸기로 분류되었습니다.
이미지 normal\832261_20211115_1_0_0_1_2_13_0_47.jpg: 익은 딸기로 분류되었습니다.
이미지 normal\832261_20211115_1_0_0_1_2_13_0_47_rotate.jpg: 익은 딸기로 분류되었습니다.
이미지 normal\894019_20211102_1_0_0_1_2_13_0_31.jpg: 익은 딸기로 분류되었습니다.
이미지 normal\894019_20211102_1_0_0_1_2_13_0_31_rotate.jpg: 익은 딸기로 분류되었습니다.
이미지 normal\894591_20211103_1_0_0_1_2_13_0_10.jpg: 익은 딸기로 분류되었습니다.
현재까지 테스트 인식률 100%
"""
