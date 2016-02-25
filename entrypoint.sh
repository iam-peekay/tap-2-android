#!/bin/bash

while [[ $# > 1 ]]
do
key="$1"

case $key in
    -e|--emulator)
    EMULATOR="$2"
    shift
    ;;
    -a|--arch)
    ARCH="$2"
    shift
    ;;
    --default)
    DEFAULT=YES
    shift
    ;;
    *)
    echo "Use \"-e android-19 -a x86\" to start Android emulator for API19 on X86 architecture.\n"
    ;;
esac
shift
done
echo EMULATOR  = "Requested API: ${EMULATOR} (${ARCH}) emulator."
if [[ -n $1 ]]; then
    echo "Last line of file specified as non-opt/last argument:"
    tail -1 $1
fi

# Run sshd
/usr/sbin/sshd

# Start the redis server in subprocess without taking up stdin
(redis-server &)

# Start ADB server for emulator
adb start-server

# Detect ip and forward ADB ports outside to outside interface
ip=$(ifconfig  | grep 'inet addr:'| grep -v '127.0.0.1' | cut -d: -f2 | awk '{ print $1}')
socat tcp-listen:5037,bind=$ip,fork tcp:127.0.0.1:5037 &
socat tcp-listen:5554,bind=$ip,fork tcp:127.0.0.1:5554 &
socat tcp-listen:5555,bind=$ip,fork tcp:127.0.0.1:5555 &

# Set up and run emulator
if [[ $ARCH == *"x86"* ]]
then
    EMU="x86"
else
    EMU="arm"
fi

# Create AVD
# echo "no" | /usr/local/android-sdk/tools/android create avd -f -n taptoandroid  -t ${EMULATOR} --skin WVGA800 --abi default/${ARCH}

# We need to turn the main keys on. Hence, we have to go through the interactive custom hardware profile options to turn config the mainkeys to be on
expect <<- DONE

spawn /usr/local/android-sdk/tools/android create avd -f -n taptoandroid  -t 11 --abi default/x86_64

expect "*?Do you wish to create a custom hardware profile*"
send "yes\r"

expect "*?Name of the AVD being run:*"
send "\n\r"

expect "*?Cache partition support: Whether we use a /cache partition on the device.*"
send "\n\r"

expect "*?Cache partition: Cache partition to use on the device. Ignored if disk.cachePartition is not 'yes'.*"
send "\n\r"

expect "*?Cache partition size:*"
send "\n\r"

expect "*?Initial data partition: If not empty, its content will be copied to the disk.dataPartition.path file at boot-time.*"
send "\n\r"

expect "*?Path to data partition file: Path to data partition file. Cannot be empty. Special value <temp> means using a temporary file. If disk.dataPartition.initPath is not empty, its content will be copied to the disk.dataPartition.path file at boot-time.*"
send "\n\r"

expect "*?Ideal size of data partition:*"
send "\n\r"

expect "*?Path to the ramdisk image: Path to the ramdisk image.*"
send "\n\r"

expect "*?Path to snapshot storage: Path to a 'snapshot storage' file, where all snapshots are stored.*"
send "\n\r"

expect "*?Cache partition size:*"
send "\n\r"

expect "*?Initial system partition image:*"
send "\n\r"

expect "*?Path to runtime system partition image:*"
send "\n\r"

expect "*?Ideal size of system partition:*"
send "\n\r"

expect "*?Accelerometer: Whether there is an accelerometer in the device.*"
send "n\r"

expect "*?Audio recording support: Whether the device can record audio*"
send "\n\r"

expect "*?Audio playback support: Whether the device can play audio*"
send "\n\r"

expect "*?Battery support: Whether the device can run on a battery.*"
send "\n\r"

expect "*?Configures camera facing back: Must be 'emulated' for a fake camera, 'webcam<N>' for a web camera, or 'none' if back camera is disabled.*"
send "\n\r"

expect "*?Configures camera facing front: Must be 'emulated' for a fake camera, 'webcam<N>' for a web camera, or 'none' if front camera is disabled.*"
send "\n\r"

expect "*?CPU Architecture: The CPU Architecture to emulator*"
send "\n\r"

expect "*?CPU model: The CPU model (QEMU-specific string)*"
send "\n\r"

expect "*?DPad support: Whether the device has DPad keys*"
send "\n\r"

expect "*?GPS support: Whether there is a GPS in the device.*"
send "\n\r"

expect "*?GPU emulation: Enable/Disable emulated OpenGLES GPU*"
send "\n\r"

expect "*?GPU emulation mode: This value determines how GPU emulation is implemented.*"
send "\n\r"

expect "*?GSM modem support: Whether there is a GSM modem in the device.*"
send "\n\r"

expect "*?Initial screen orientation: Setup initial screen orientation, can be rotated later on.*"
send "\n\r"

expect "*?Keyboard support: Whether the device has a QWERTY keyboard.*"
send "yes\r"

expect "*?Keyboard charmap name: Name of the system keyboard charmap file.*"
send "\n\r"

expect "*?Keyboard lid support: Whether the QWERTY keyboard can be opened/closed.*"
send "\n\r"

expect "*?LCD backlight: Enable/Disable LCD backlight simulation,yes-enabled,no-disabled.*"
send "\n\r"

expect "*?Abstracted LCD density: A value used to roughly describe the density of the LCD screen for automatic resource/asset selection.*"
send "\n\r"

expect "*?LCD color depth: Color bit depth of emulated framebuffer.*"
send "\n\r"

expect "*?LCD pixel height:*"
send "\n\r"

expect "*?LCD pixel width:*"
send "\n\r"

expect "*?Hardware Back/Home keys: Whether there are hardware back/home keys on the device*"
send "no\r"

expect "*?Device ram size: The amount of physical RAM on the device, in megabytes.*"
send "\n\r"

expect "*?Touch screen type: Defines type of the screen.*"
send "\n\r"

expect "*?SD Card support: Whether the device supports insertion/removal of virtual SD Cards.*"
send "\n\r"

expect "*?SD Card image path:*"
send "\n\r"

expect "*?Magnetic field support: Provides magnetic field sensor values.*"
send "\n\r"

expect "*?Orientation support: Provides orientation sensor values.*"
send "\n\r"

expect "*?Proximity support: Whether there is an proximity in the device.*"
send "\n\r"

expect "*?Temperature support: Provides temperature sensor values.*"
send "\n\r"

expect "*?Track-ball support: Whether there is a trackball on the device.*"
send "\n\r"

expect "*?Deprecated option. Ignored.: Used to specify the Ext4 partition image type. This is now autodetected.*"
send "\n\r"

expect "*?Does the kernel require a new device naming scheme?: Used to specify whether the kernel requires a new device naming scheme. Typically for Linux 3.10 and above.*"
send "\n\r"

expect "*?Abstracted LCD density: A value used to roughly describe the density of the LCD screen for automatic resource/asset selection.*"
send "\n\r"

expect "*?kernel boot parameters string.:*"
send "\n\r"

expect "*?Path to the kernel image: Path to the kernel image.*"
send "\n\r"

expect "*?Does the kernel supports YAFFS2 partitions?: Used to specify whether the kernel supports YAFFS2 partition images. Typically before 3.10 only.*"
send "\n\r"

expect "*?Max VM application heap size: The maximum heap size a Dalvik application might allocate before being killed by the system. Value is in megabytes.*"
send "\n\r"

expect eof

DONE

sleep 20

# Start emulator
(echo "no" | /usr/local/android-sdk/tools/emulator64-x86 -avd taptoandroid -noaudio -no-window -gpu off -no-boot-anim -timezone America/Los_Angeles -verbose -qemu -vnc :2 &)

# Allow the emulator to boot up, then start node server
sleep 120

(python server/emulator/androidViewClient.py &)

sleep 20

npm start
