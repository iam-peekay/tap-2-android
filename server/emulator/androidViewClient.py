#!/usr/bin/python

# Connecting to Android device
import sys
import os
import time
try:
    sys.path.append(os.path.join(os.environ['ANDROID_VIEW_CLIENT_HOME'], 'src'))
except:
    pass

from com.dtmilano.android.adb import adbclient
import com.dtmilano.android.viewclient as viewclient
device, serialno = viewclient.ViewClient.connectToDeviceOrExit(verbose=True)

# POWER button press doesn't work to turn on
device.wake()

# Connecting to zerorpc
import zerorpc
class HelloRPC(object):
    def handle_user_input(self, input_type, data):
        if input_type is None:
            return 'Oops, you forgot to provide a correct input type'
        elif input_type == 'touch':
            device.touch(data['x'], data['y'], adbclient.DOWN_AND_UP)
            return 'Touched!'
        elif input_type == 'drag':
            device.drag((data['startX'], data['startY']), (data['endX'], data['endY']), 1.0, 120)
            return 'Drag!'
        elif input_type == 'menu':
            device.press('KEYCODE_MENU', adbclient.DOWN_AND_UP)
            return 'Menu!'
        elif input_type == 'volumeUp':
            device.press('KEYCODE_VOLUME_UP', adbclient.DOWN_AND_UP)
            return 'Volume up!'
        elif input_type == 'home':
            device.press('KEYCODE_HOME', adbclient.DOWN_AND_UP)
            return 'Home!'
        else:
            return 'Oops, something went wrong. Please provide the correct input type'
    def unlock_phone(self):
        device.drag((500, 1800), (500, 200), 1.0, 120)
        return 'Unlocked!'

s = zerorpc.Server(HelloRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()
device.drag((500, 1800), (500, 200), 1.0, 120)
