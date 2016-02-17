SHELL := /bin/bash
ALIAS = "android_emulator_machine"
EXISTS := $(shell docker ps -a -q -f name=$(ALIAS))
RUNNED := $(shell docker ps -q -f name=$(ALIAS))
ifneq "$(RUNNED)" ""
IP := $(shell docker inspect $(ALIAS) | grep "IPAddress\"" | head -n1 | cut -d '"' -f 4)
endif
STALE_IMAGES := $(shell docker images | grep "<none>" | awk '{print($$3)}')
EMULATOR ?= "android-23"
ARCH ?= "x86"
RUNNINGIMAGE_PID := $(shell ps aux | grep /Users/peekay/Library/Android/sdk/tools/emulator64-x86 | tail -n1 | awk '{print $2}')
COLON := :

.PHONY = run ports kill ps

startEmu:
	@emulator -avd Nexus_5_API_23 -no-window -gpu off -cpu-delay 0 -no-boot-anim -qemu -vnc :2 &

killEmu:
	@kill -9 $(RUNNINGIMAGE_PID)
all:
	@docker build -t android_emulator .
	@docker images

run: clean
	@docker run -d -P --name android_emulator_machine --log-driver=json-file android_emulator -e $(EMULATOR) -a $(ARCH)

clean: kill
	@docker ps -a -q | xargs -n 1 -I {} docker rm -f {}
ifneq "$(STALE_IMAGES)" ""
	@docker rmi -f $(STALE_IMAGES)
endif

kill:
ifneq "$(RUNNED)" ""
	@docker kill $(ALIAS)
endif

ps:
	@docker ps -a -f name=$(ALIAS)
