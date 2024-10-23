#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Stepper.h>

// 핀 설정 (L298N Motor Driver와 NEMA17 모터 연결)
const int IN1 = D1; // L298N IN1 → NEMA17 선 1
const int IN2 = D2; // L298N IN2 → NEMA17 선 2
const int IN3 = D3; // L298N IN3 → NEMA17 선 3
const int IN4 = D4; // L298N IN4 → NEMA17 선 4

// ENA와 ENB 핀 설정 (L298N 전원 제어)
const int ENA = D5;  // L298N의 ENA 핀을 GPIO14에 연결 (전원 제어)
const int ENB = D6;  // L298N의 ENB 핀을 GPIO12에 연결 (전원 제어)

// 스텝 수와 회전수 설정 (NEMA17 모터)
const int STEPS_PER_REV = 200;  // 모터의 한 바퀴당 스텝 수
const float ROTATIONS = 9.75;   // 한 번 회전 명령당 9.75 바퀴 회전
const float STEPS_TO_MOVE = STEPS_PER_REV * ROTATIONS;  // 회전할 스텝 수

// 모터 속도 설정 (RPM)
const int motorSpeed = 120;  // 모터 속도 (예: 100 RPM)

// Wi-Fi credentials
const char* ssid = "pi";
const char* password = "xodn010219";

// MQTT Broker settings
const char* mqtt_server = "192.168.137.106";
const char* mqtt_topic = "nodemcu/side";
const char* client_id = "side_1";

// Wi-Fi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// Stepper 모터 객체 생성 (L298N 핀 연결)
Stepper stepper_NEMA17(STEPS_PER_REV, IN1, IN2, IN3, IN4);

// 상태 변수
bool motorActivated = false;
long stepsLeft = 0;  // 남은 스텝 수
int stepDirection = 1;  // 1이면 시계 방향, -1이면 반시계 방향
bool isMotorRunning = false;  // 모터 동작 상태

// Function prototypes
void connectToMQTT();
void callback(char* topic, byte* payload, unsigned int length);
void handleMotor();
void stopMotor();
void enableMotor();
void disableMotor();

void setup() {
  // GPIO 핀 설정
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT);  // ENA 핀을 출력으로 설정
  pinMode(ENB, OUTPUT);  // ENB 핀을 출력으로 설정
  
  // 기본적으로 모터 전원 차단 (LOW 상태)
  digitalWrite(ENA, LOW);
  digitalWrite(ENB, LOW);

  // 시리얼 통신 시작
  Serial.begin(9600);

  // Wi-Fi 연결
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Wi-Fi 연결됨!");

  // MQTT 설정
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // MQTT 연결 시도
  connectToMQTT();

  // 모터 속도 설정
  stepper_NEMA17.setSpeed(motorSpeed);
}

// MQTT 메시지 처리 함수
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("메시지 도착: " + message);

  // "ON" 메시지 수신 시 시계 방향으로 9.75바퀴 회전
  if (message == "ON" && !motorActivated && !isMotorRunning) {
    motorActivated = true;
    stepsLeft = STEPS_TO_MOVE;
    stepDirection = 1;  // 시계 방향
    isMotorRunning = true;
    
    enableMotor();  // 모터 전원 공급
    Serial.println("모터 ON 명령 처리 시작");
  }

  // "OFF" 메시지 수신 시 반시계 방향으로 9.75바퀴 회전
  else if (message == "OFF" && !motorActivated && !isMotorRunning) {
    motorActivated = true;
    stepsLeft = STEPS_TO_MOVE;
    stepDirection = -1;  // 반시계 방향
    isMotorRunning = true;
    
    enableMotor();  // 모터 전원 공급
    Serial.println("모터 OFF 명령 처리 시작");
  }
}

// MQTT 연결 처리 함수
void connectToMQTT() {
  while (!client.connected()) {
    Serial.print("MQTT 연결 중...");
    if (client.connect(client_id)) {
      Serial.println("MQTT 연결됨!");
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("연결 실패, rc=");
      Serial.print(client.state());
      delay(5000);  // 연결 재시도
    }
  }
}

// Wi-Fi 재연결 확인 함수
void checkWiFiAndReconnect() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
    }
    Serial.println("Wi-Fi 재연결 완료");
  }
}

// 모터 전원 공급
void enableMotor() {
  digitalWrite(ENA, HIGH);  // ENA 핀을 HIGH로 설정해 전원 공급
  digitalWrite(ENB, HIGH);  // ENB 핀을 HIGH로 설정해 전원 공급
  Serial.println("모터 전원 공급 시작");
}

// 모터 전원 차단
void disableMotor() {
  digitalWrite(ENA, LOW);  // ENA 핀을 LOW로 설정해 전원 차단
  digitalWrite(ENB, LOW);  // ENB 핀을 LOW로 설정해 전원 차단
  Serial.println("모터 전원 차단");
}

// 모터 동작 완료 후 상태 초기화 함수
void stopMotor() {
  motorActivated = false;
  isMotorRunning = false;
  stepsLeft = 0;
  disableMotor();  // 모터 전원 차단
  Serial.println("모터 정지 및 전원 차단");
}

// 모터를 동작시키는 함수
void handleMotor() {
  if (motorActivated && stepsLeft > 0) {
    stepper_NEMA17.step(stepDirection);
    stepsLeft--;

    // 와치독 타이머 수동 리셋
    ESP.wdtFeed();

    // 모든 스텝을 완료했을 때
    if (stepsLeft == 0) {
      stopMotor();  // 모터 정지 및 상태 초기화
    }
  }
}

void loop() {
  checkWiFiAndReconnect();
  
  if (!client.connected()) {
    connectToMQTT();
  }

  client.loop();  // MQTT 통신 처리
  
  // 모터 제어 처리
  handleMotor();
}
