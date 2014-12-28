Network Thermometer
----
Simple Arduino code for a networked temerature sensor.

##### The Arduino

In my case an [Arduino UNO](http://arduino.cc/en/Main/ArduinoBoardUno) with an [Arduino Ethernet Shield](http://arduino.cc/en/Main/ArduinoEthernetShield).

##### The Temperature sensor

An [Adafruit AM2302](https://www.adafruit.com/products/393).  Simple, cheap and effective.

##### The Data Store

I use a [Phant](https://github.com/sparkfun/phant) based data store to store the data, specifically the free service offered by [data.sparkfun.com](https://data.sparkfun.com) -- tho you can use any.  This makes the data accessable for those pretty graphs.

##### The Graphs

Speaking of graphs, the page at [http://lectroid.github.io/networked-themometer](http://lectroid.github.io/networked-themometer) uses [Highcharts](http://www.highcharts.com/) to display the data.  Of course you'll need your own Phant keys to access your own data.
