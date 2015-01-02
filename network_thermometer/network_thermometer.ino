/*
 *
 */

#include <SPI.h>
#include <Ethernet.h>
#include <DHT.h>

#include "keys.h"

#define DHTPIN               7        // what pin we're connected to
#define DHTTYPE              DHT22    // DHT 22  (AM2302)

#define RESPONSE_TIMEOUT     3000    // 3 sec
#define MEASUREMENT_INTERVAL 60000   // 1 min
#define HEARTBEAT_INTERVAL   900000  // 15 min

EthernetClient client;
byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0xAC, 0x36 };

DHT dht = DHT(DHTPIN, DHTTYPE);

int saved_temperature, saved_humidity;
unsigned long lastMeasurementTime = 0;
unsigned long lastTransmitTime = 0;


void setup() {
  Serial.begin(115200);
  Serial.println(F("\nNetwork Thermometer."));

  while (!Ethernet.begin(mac)) {
    Serial.println(F("DHCP error!"));
    delay(30000);
  }

  // give the Ethernet shield a second to initialize:
  delay(1000);

  Serial.print(F("Configured at: "));
  Serial.println(Ethernet.localIP());

  dht.begin();

  Serial.println(F("Waiting for data..."));
}


void loop () {
  unsigned long now = millis();

  if (now > lastMeasurementTime + MEASUREMENT_INTERVAL) {
    float h = dht.readHumidity();
    float f = dht.readTemperature(true);

    if (isnan(h) || isnan(f)) {
      Serial.println(F("Failed to read from DHT sensor!"));
    } else {
      lastMeasurementTime = now;

      int humidity = round(h);
      int temperature = round(f);

      Serial.print(F("Read: "));
      Serial.print(temperature);
      Serial.print(F("F, "));
      Serial.print(humidity);
      Serial.println(F("%"));

      boolean dataChanged = temperature != saved_temperature || humidity != saved_humidity;
      boolean wantHeartbeat = now > lastTransmitTime + HEARTBEAT_INTERVAL;

      if (dataChanged || wantHeartbeat) {
        if (dataChanged) {
          Serial.println(F("Data changed, sending to web..."));
        } else if (wantHeartbeat) {
          Serial.println(F("Data hasn't changed, sending as a heartbeat..."));
        }

        if (updateWeb(temperature, humidity)) {
          saved_temperature = temperature;
          saved_humidity = humidity;
          lastTransmitTime = now;
        }
      }
    }
  }

  // Handle millis() rollover
  if (now < lastMeasurementTime) {
    lastMeasurementTime = 0;
    lastTransmitTime = 0;
  }
}


boolean updateWeb (int temperature, int humidity) {
  if ( !client.connect(PHANT_HOST, PHANT_HOST_PORT) ) {
    Serial.println(F("Error: Could not make a TCP connection"));
    return false;
  }

  client.print(F("GET /input/")); client.print(PHANT_PUBLIC_KEY);
  client.print(F("?private_key=")); client.print(PHANT_PRIVATE_KEY);
  client.print(F("&temperature=")); client.print(temperature);
  client.print(F("&humidity=")); client.print(humidity);
  client.println(F(" HTTP/1.1"));
  client.print("Host: "); client.println(PHANT_HOST);
  client.println();

  // Show the response
  unsigned long lastRead = millis();
  while (client.connected() && (millis() - lastRead < RESPONSE_TIMEOUT)) {
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
      lastRead = millis();
    }
  }

  client.stop();
  Serial.println(F("Done."));
  return true;
}

