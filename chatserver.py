import asyncio
import websockets
import random
import json

clients = set()
client_names = {"system": "system"}
names = ["Alfa",
         "Bravo",
         "Charlie",
         "Delta",
         "Echo",
         "Foxtrot",
         "Golf",
         "Hotel",
         "India",
         "Juliett",
         "Kilo",
         "Lima",
         "Mike",
         "November",
         "Oscar",
         "Papa",
         "Quebec",
         "Romeo",
         "Sierra",
         "Tango",
         "Uniform",
         "Victor",
         "Whiskey",
         "X-ray",
         "Yankee",
         "Zulu"]

history = []


async def broadcast(sender, msg):
    print(client_names[sender], ": ", msg)
    for client in clients:
        try:
            await client.send(json.dumps({"type": "message", "sender": client_names[sender], "content": msg}))
        except websockets.exceptions.ConnectionClosedOK:
            pass
    history.append(json.dumps(
        {"type": "message", "sender": client_names[sender], "content": msg}))
    if len(history) > 50:
        history.pop(0)


async def register(client):
    name = random.choice(names)
    while name in client_names.values():
        name = random.choice(names)
    client_names[client] = name
    clients.add(client)
    await client.send(json.dumps({"type": "set_name", "name": name}))
    for msg in history:
        await client.send(msg)
    await broadcast("system", name + " has joined.")


async def unregister(client):
    await broadcast("system", client_names[client] + " has left.")
    clients.remove(client)
    client_names.pop(client)


async def on_connect(websocket, path):
    await register(websocket)
    async for message in websocket:
        await broadcast(websocket, message)
    await unregister(websocket)

start_server = websockets.serve(on_connect, "0.0.0.0", 7779)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
