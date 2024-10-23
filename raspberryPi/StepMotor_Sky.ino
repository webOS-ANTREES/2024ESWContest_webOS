#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// 핀 설정 (DRV8825용)
const int dirPin = 4;   // DIR 핀 (GPIO 4)
const int stepPin = 2;  // 스텝 핀 (GPIO 2)
const int enablePin = 5; // ENABLE 핀 (GPIO5, D1)

// 한 바퀴당 스텝 수 (NEMA17 모터의 경우 200 스텝)
const float STEPS_PER_REV = 200;
const float NUM_OF_REVS = 1.4;  // 1.4바퀴
// 한 바퀴당 필요한 스텝 수
const float totalSteps = STEPS_PER_REV * NUM_OF_REVS;

// 모터 속도를 설정 (딜레이 값, 마이크로초)
const int stepDelay = 1000;  // 모터 속도 설정 (딜레이를 늘림)

// Wi-Fi credentials
const char* ssid = "pi";
const char* password = "xodn010219";

// MQTT Broker settings
const char* mqtt_server = "192.168.137.106";
const char* mqtt_topic = "nodemcu/sky";
const char* client_id = "sky_1";

// Wi-Fi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// 상태 변수
bool motorActivated = false;
int stepsLeft = totalSteps;  // 남은 스텝 수
unsigned long previousStepTime = 0;  // 이전 스텝을 실행한 시간 기록
bool mqttConnected = false;  // MQTT 연결 상태 추적
bool wifiConnected = false;  // Wi-Fi 연결 상태 추적
bool lastCommandWasOff = false;  // 마지막 명령이 OFF였는지 추적 (시작 시 OFF로 설정)

// Function prototypes
void rotateMotorAsync(int stepsToMove, int speed);
void connectToMQTT();
void callback(char* topic, byte* payload, unsigned int length);

void setup() {
  // GPIO 핀 설정
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(enablePin, OUTPUT);  // ENABLE 핀 설정
  digitalWrite(enablePin, HIGH); // 기본적으로 모터 비활성화 (HIGH 상태)

  // 시리얼 통신 시작
  Serial.begin(9600);

  // Wi-Fi 연결
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Wi-Fi 연결됨!");
  WiFi.setSleepMode(WIFI_NONE_SLEEP);

  // MQTT 설정
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // MQTT 연결 시도
  connectToMQTT();
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("메시지 도착: " + message);

  // ON 메시지를 받으면 모터를 시계 방향으로 회전
  if (message == "ON" && !motorActivated) {
    motorActivated = true;
    stepsLeft = totalSteps;  // 스텝 수 초기화
    digitalWrite(enablePin, LOW);  // 모터 활성화 (전류 공급)
    rotateMotorAsync(totalSteps, true);  // 시계 방향 회전 (direction = true)
    lastCommandWasOff = false;  // 마지막 명령은 ON 상태
    Serial.println("모터 활성화 및 시계 방향 회전 중");
  }

  // OFF 메시지를 받으면 모터 전류를 끊고 잠시 후에 반시계 방향으로 회전
  else if (message == "OFF" && motorActivated) {
    motorActivated = false;

    // 1. 먼저 전류를 잠시 끊어 모터를 해제
    digitalWrite(enablePin, HIGH);  // 모터 비활성화 (전류 차단)
    delay(100);  // 잠시 대기 (필요에 따라 조정 가능)

    // 2. 다시 전류를 공급한 후 반시계 방향으로 회전
    stepsLeft = totalSteps;  // 스텝 수 초기화
    digitalWrite(enablePin, LOW);  // 모터 활성화 (전류 재공급)
    rotateMotorAsync(totalSteps, false);  // 반시계 방향 회전 (direction = false)
    lastCommandWasOff = true;  // 마지막 명령은 OFF 상태
    Serial.println("모터 비활성화 예정, 반시계 방향 회전 중");
  }
}





void rotateMotorAsync(int stepsToMove, bool direction) {
  // 방향 설정: true면 시계 방향, false면 반시계 방향
  digitalWrite(dirPin, direction ? LOW : HIGH);  // LOW = 시계방향, HIGH = 반시계방향
  stepsLeft = stepsToMove;  // 남은 스텝 수는 받은 값 그대로 설정
  previousStepTime = millis();  // 현재 시간을 저장
}



void handleMotor() {
  if (stepsLeft > 0) {
    unsigned long currentTime = millis();
    if (currentTime - previousStepTime >= (stepDelay / 1000)) {  // 논블로킹 딜레이 처리
      previousStepTime = currentTime;

      // STEP 핀에 펄스 발생
      digitalWrite(stepPin, HIGH);
      delayMicroseconds(10);  // 짧은 펄스 유지 시간
      digitalWrite(stepPin, LOW);

      stepsLeft--;  // 남은 스텝 수 감소

      // 모터가 OFF 명령을 완료하면 ENABLE 핀을 HIGH로 설정하여 비활성화
      if (stepsLeft == 0 && !motorActivated) {
        digitalWrite(enablePin, HIGH);  // 모터 비활성화 (전류 차단)
        Serial.println("모터 비활성화됨, ENABLE 핀 HIGH");
      }
    }
  }
}

void connectToMQTT() {
  if (!mqttConnected) {
    while (!client.connected()) {
      Serial.print("MQTT 연결 중...");
      if (client.connect(client_id)) {
        Serial.println("MQTT 연결됨!");
        client.subscribe(mqtt_topic);
        mqttConnected = true;
      } else {
        Serial.print("연결 실패, rc=");
        Serial.print(client.state());
        delay(5000);  // 연결 재시도
      }
    }
  }
}

void checkWiFiAndReconnect() {
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    Serial.println("Wi-Fi 연결 끊김, 재연결 중...");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
    }
    Serial.println("Wi-Fi 재연결 성공");
  }
}

void loop() {
  checkWiFiAndReconnect();
  
  if (!client.connected()) {
    mqttConnected = false;  // MQTT 연결이 끊겼다고 설정
    connectToMQTT();
  }

  client.loop();  // MQTT 통신 처리
  handleMotor();  // 논블로킹 모터 처리
}
