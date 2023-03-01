import eventlet
import socketio
import uuid
import random

sio = socketio.Server(async_mode='threading')
app = socketio.WSGIApp(sio)

workers = {}  # dictionary to store worker instances


@sio.on('connect')
def connect(sid, environ):
    print('Connected:', sid)


@sio.on('disconnect')
def disconnect(sid):
    if sid in workers:
        del workers[sid]
        print('Worker disconnected:', sid)


@sio.on('register')
def register(sid):
    worker_id = str(uuid.uuid4())  # generate a unique worker id
    workers[sid] = {'id': worker_id, 'available': True}
    sio.emit('registered', worker_id, room=sid)
    print('Worker registered:', worker_id)


@sio.on('command')
def command(sid, cmd):
    # select an idle worker to send the command
    available_workers = [w for w in workers.values() if w['available']]
    if not available_workers:
        sio.emit('error', 'No available workers', room=sid)
    else:
        worker = random.choice(available_workers)
        worker['available'] = False
        sio.emit('command', cmd, room=sid)


@sio.on('done')
def done(sid):
    # set worker as available again
    if sid in workers:
        workers[sid]['available'] = True


# Define application services API
# ...

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
