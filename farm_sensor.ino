#include <SoftwareSerial.h>
#include <dht.h>
#include <Wire.h>
#include <BH1750FVI.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// MH-Z19 시리얼 설정 (RX, TX)
SoftwareSerial mh_z19(2, 3); // 예: RX=2, TX=3

// DHT22 센서 설정
#define DHTPIN 4     // DHT 센서의 데이터 핀을 아두이노의 핀 4에 연결
dht DHT;

// BH1750 광 센서 설정
BH1750FVI::eDeviceMode_t DEVICEMODE = BH1750FVI::k_DevModeContHighRes;
BH1750FVI LightSensor(DEVICEMODE);

// Dallas 온도 센서 설정
#define ONE_WIRE_BUS 5
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
DeviceAddress tempDeviceAddress; // 수온 센서 주소 저장용

// pH 센서 설정
#define SensorPin A0
#define Offset7 0.25  // pH 7.0 보정 오프셋
#define Offset4 -1.93  // pH 4.0 보정 오프셋 (임의 값으로 설정 후 조정 가능)
#define samplingInterval 20
#define printInterval 800
#define ArrayLenth 40

int pHArray[ArrayLenth];
int pHArrayIndex = 0;
float voltage, phVal, waterTemp, illuminance;

void setup() {
  Serial.begin(9600);  // 시리얼 통신 설정
  mh_z19.begin(9600);  // MH-Z19와의 시리얼 통신 설정
  LightSensor.begin(); // BH1750 광센서 시작

  sensors.begin(); // 수온 센서 시작

  // 온도 센서 연결 확인
  if (!sensors.getAddress(tempDeviceAddress, 0)) {
    Serial.println("Unable to find temperature sensor address");
    while (true); // 센서 주소를 찾지 못하면 멈춤
  }

  Serial.println("Sensors are starting...");
}

void loop() {
  // MH-Z19 센서로부터 CO2 값을 읽음
  int CO2Value = readCO2();
  
  // DHT22 센서로부터 온도와 습도 값을 읽음
  int readData = DHT.read22(DHTPIN);
  float humidity = DHT.humidity;
  float airTemp = DHT.temperature;

  // BH1750 센서로부터 조도 값을 읽음
  illuminance = LightSensor.GetLightIntensity();

  // pH 값 측정
  static unsigned long samplingTime = millis();
  if (millis() - samplingTime > samplingInterval) {
    pHArray[pHArrayIndex++] = analogRead(SensorPin);
    if (pHArrayIndex == ArrayLenth) pHArrayIndex = 0;
    
    voltage = averageArray(pHArray, ArrayLenth) * 5.0 / 1024;
    phVal = (voltage >= 1.75) ? 3.5 * voltage + Offset7 : 3.5 * voltage + Offset4;
    samplingTime = millis();
  }

  // Dallas 온도 센서로부터 수온 값을 읽음
  sensors.requestTemperatures();
  waterTemp = sensors.getTempCByIndex(0);

  // 데이터를 시리얼로 출력 (쉼표로 구분)
  Serial.print("CO2: ");
  Serial.print(CO2Value);
  Serial.print(", Temperature: ");
  Serial.print(airTemp);
  Serial.print(", Humidity: ");
  Serial.print(humidity);
  Serial.print(", Illuminance: ");
  Serial.print(illuminance);
  Serial.print(", pH: ");
  Serial.print(phVal);
  Serial.print(", Water Temperature: ");
  Serial.println(waterTemp);

  delay(2000);  // 2초마다 데이터 전송
}

// MH-Z19에서 CO2 값을 읽어오는 함수
int readCO2() {
  byte response[9];  // 응답 데이터 버퍼

  mh_z19.write((byte)0xFF);
  mh_z19.write((byte)0x01);
  mh_z19.write((byte)0x86);
  mh_z19.write((byte)0x00);
  mh_z19.write((byte)0x00);
  mh_z19.write((byte)0x00);
  mh_z19.write((byte)0x00);
  mh_z19.write((byte)0x00);
  mh_z19.write((byte)0x79);

  // 센서 응답을 읽음
  mh_z19.readBytes(response, 9);

  if (response[0] == 0xFF && response[1] == 0x86) {
    int CO2 = response[2] * 256 + response[3];
    return CO2;
  } else {
    return -1; // 에러 발생 시 -1 리턴
  }
}

// 배열의 평균을 계산하는 함수
double averageArray(int* arr, int number) {
  long amount = 0;
  for (int i = 0; i < number; i++) {
    amount += arr[i];
  }
  return (double)amount / number;
}
