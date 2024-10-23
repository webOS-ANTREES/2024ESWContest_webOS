#include <Servo.h>

Servo motor1;
Servo motor2;

void setup() {
  motor1.attach(12);  // 서보 모터를 핀 12에 연결
  motor2.attach(13);  // 서보 모터를 핀 13에 연결
  Serial.begin(9600);  // 시리얼 통신 시작
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();  // 시리얼로부터 명령어 읽기
    if (command == '1') {
      motor1.write(45);  // 모터를 45도로 회전
      motor2.write(0);
      delay(400);  // 0.4초 대기

      motor1.write(0);  // 다시 0도로 회전
      motor2.write(45);
      delay(500);  // 0.5초 대기
      
      motor1.write(45);  // 모터를 45도로 회전
      motor2.write(0);
      delay(400);  // 0.4초 대기
    }
    else if (command == '0') {
      motor1.write(45);  // 모터 정지
      motor2.write(0);
    }
  }
}
