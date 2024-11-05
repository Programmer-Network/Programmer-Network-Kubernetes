import time
from gpiozero import OutputDevice
import psutil

FAN_PIN = 18
TEMP_ON = 60
TEMP_OFF = 50

fan = OutputDevice(FAN_PIN)

def get_cpu_temperature():
    temp = psutil.sensors_temperatures()['cpu_thermal'][0].current
    return temp

def control_fan():
    current_temp = get_cpu_temperature()
    if current_temp >= TEMP_ON:
        if not fan.value:
            print(f"Temperature is {current_temp}°C — Turning fan ON")
            fan.on()
    elif current_temp <= TEMP_OFF:
        if fan.value:
            print(f"Temperature is {current_temp}°C — Turning fan OFF")
            fan.off()

if __name__ == '__main__':
    try:
        while True:
            control_fan()
            time.sleep(5)
    except KeyboardInterrupt:
        fan.off()
        print("Fan control stopped.")
