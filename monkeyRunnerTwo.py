import sys
from subprocess import PIPE, Popen
from threading  import Thread

try:
    from Queue import Queue, Empty
except ImportError:
    from queue import Queue, Empty  # python 3.x

def enqueue_output(out, queue):
    for line in iter(out.readline, b''):
        queue.put(line)
    out.close()

p = Popen(['python', 'shell.py'], stdout=PIPE, stderr=PIPE, stdin=PIPE, , shell = False)
q = Queue()
print p.stdout
t = Thread(target=enqueue_output, args=(p.stdout, q))
t.daemon = True # thread dies with the program
t.start()

# ... do other things here

# read line without blocking
try:
    line = q.get(timeout=1)
except Empty:
    print 'no output yet :('
else: # got line
    print line
