#!/usr/bin/python

# Sys for handling process.stdin
import sys

# Imports the monkeyrunner modules used by this program
from com.android.monkeyrunner import MonkeyRunner, MonkeyDevice

# Connects to the current device, returning a MonkeyDevice object
device = MonkeyRunner.waitForConnection()

print 'Device is connected!'

# monkeyrunner method to unlock the screen
# POWER button press doesn't work to turn on
device.wake()

print 'Device is awake'
# drag the lock button from center bottom to center top
device.drag((400, 1800), (400, 200), 1.0, 120)

print 'Device is unlocked'

# Wait for few seconds
MonkeyRunner.sleep(5)


def handle_user_input(input_type):
    "Handles user input to device using Monkeyrunner"
    if input_type is None:
        return
    elif input_type == 'hello':
        device.press('KEYCODE_MENU', MonkeyDevice.DOWN_AND_UP)
    else:
        print 'Oops, something went wrong. No hello'

while True:
    handle_user_input(sys.argv[1])
