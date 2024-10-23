import asyncio
import websockets
import base64
import cv2

async def video_stream(websocket, path):
    print("Client connected")
    
    cap = cv2.VideoCapture(0)  # 라즈베리파이의 카메라
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 프레임을 JPG로 인코딩 후 base64로 변환
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')

        # WebSocket을 통해 프레임 전송
        await websocket.send(frame_base64)

# WebSocket 서버 실행
start_server = websockets.serve(video_stream, "0.0.0.0", 8765)

print("WebSocket Server started on port 8765")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
