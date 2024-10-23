#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// 핀 설정 (DRV8825용)
const int dirPin = 4;   // DIR 핀 (GPIO 4)
const int stepPin = 2;  // 스텝 핀 (GPIO 2)
const int enablePin = 5; // ENABLE 핀 (GPIO 5)

// 한 바퀴당 스텝 수 (NEMA17 모터의 경우 200 스텝)
const float STEPS_PER_REV = 200;
const float NUM_OF_REVS = 32; // 32바퀴
// 한 바퀴당 필요한 스텝 수
const float totalSteps = STEPS_PER_REV * NUM_OF_REVS;

// 모터 속도를 설정 (딜레이 값, 마이크로초)
const int stepDelay = 1000;  // 모터 속도 설정 (딜레이를 늘림)

// Wi-Fi credentials
const char* ssid = "pi";
const char* password = "xodn010219";

// MQTT Broker settings
const char* mqtt_server = "192.168.137.106";
const char* mqtt_topic = "nodemcu/ceiling";
const char* client_id = "Ceiling_1";

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
  pinMode(enablePin, OUTPUT); // ENABLE 핀 설정
  digitalWrite(enablePin, HIGH);  // 처음에는 모터 전류 차단

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

  // 'ON' 메시지 수신 시 모터를 시계 방향으로 회전
  if (message == "ON" && !motorActivated && lastCommandWasOff == false) {
    motorActivated = true;
    stepsLeft = totalSteps;  // 스텝 수 초기화
    digitalWrite(enablePin, LOW);  // 모터 전류 공급 (ENABLE LOW)
    rotateMotorAsync(totalSteps, stepDelay);  // 시계 방향 회전
    lastCommandWasOff = true;  // 마지막 명령을 OFF로 설정
    Serial.println("모터 ON: 시계 방향으로 회전 중");
  }

  // 'OFF' 메시지 수신 시 모터를 반시계 방향으로 회전
  else if (message == "OFF" && motorActivated && lastCommandWasOff == true) {
    motorActivated = false;
    stepsLeft = totalSteps;  // 스텝 수 초기화
    digitalWrite(enablePin, LOW);  // 모터 전류 공급 (ENABLE LOW)
    rotateMotorAsync(-totalSteps, stepDelay);  // 반시계 방향 회전
    lastCommandWasOff = false;  // 마지막 명령을 ON으로 설정
    Serial.println("모터 OFF: 반시계 방향으로 회전 중");
  }
}

void rotateMotorAsync(int stepsToMove, int speed) {
  int direction = (stepsToMove > 0) ? LOW : HIGH;  // 방향 결정
  digitalWrite(dirPin, direction);
  stepsLeft = abs(stepsToMove);  // 남은 스텝 수 설정
  previousStepTime = millis();  // 시작 시간 설정
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

      // 모든 스텝이 끝나면 모터 비활성화
      if (stepsLeft == 0) {
        digitalWrite(enablePin, HIGH);  // 모터 전류 차단 (ENABLE HIGH)
        Serial.println("모터 전류 차단: ENABLE 핀 HIGH");
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
