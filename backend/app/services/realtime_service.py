import asyncio
import json
import base64
import websockets
from fastapi import WebSocket
from datetime import datetime
from app.config import settings

class RealtimeCallHandler:
    """Handler for OpenAI Realtime API voice calls."""
    
    def __init__(self, client_websocket: WebSocket, system_prompt: str):
        self.client_ws = client_websocket
        self.system_prompt = system_prompt
        self.openai_ws = None
        self.transcript = []
        self.start_time = None
        self.duration = 0
        
    async def handle_call(self) -> str:
        """Handle the entire call session."""
        self.start_time = datetime.utcnow()
        
        # Connect to OpenAI Realtime API
        openai_url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "OpenAI-Beta": "realtime=v1"
        }
        
        try:
            async with websockets.connect(openai_url, extra_headers=headers) as openai_ws:
                self.openai_ws = openai_ws
                
                # Send session configuration
                await self.configure_session()
                
                # Create tasks for bidirectional streaming
                client_to_openai = asyncio.create_task(self.forward_client_to_openai())
                openai_to_client = asyncio.create_task(self.forward_openai_to_client())
                
                # Wait for both tasks
                await asyncio.gather(client_to_openai, openai_to_client, return_exceptions=True)
                
        except Exception as e:
            print(f"Error in Realtime API: {e}")
            await self.client_ws.send_json({
                "type": "error",
                "message": f"Connection error: {str(e)}"
            })
        
        # Calculate duration
        end_time = datetime.utcnow()
        self.duration = int((end_time - self.start_time).total_seconds())
        
        # Return transcript as string
        return "\n".join(self.transcript)
    
    async def configure_session(self):
        """Configure the Realtime API session with persona."""
        config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": self.system_prompt,
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500
                }
            }
        }
        await self.openai_ws.send(json.dumps(config))
    
    async def forward_client_to_openai(self):
        """Forward audio from client to OpenAI."""
        try:
            while True:
                message = await self.client_ws.receive_json()
                
                if message.get("type") == "audio":
                    # Forward audio data to OpenAI
                    await self.openai_ws.send(json.dumps({
                        "type": "input_audio_buffer.append",
                        "audio": message["data"]
                    }))
                    
                elif message.get("type") == "end_call":
                    # Client ended the call
                    break
                    
        except Exception as e:
            print(f"Error forwarding client to OpenAI: {e}")
    
    async def forward_openai_to_client(self):
        """Forward responses from OpenAI to client."""
        try:
            while True:
                message = await self.openai_ws.recv()
                data = json.loads(message)
                
                event_type = data.get("type")
                
                if event_type == "response.audio.delta":
                    # Forward audio back to client
                    await self.client_ws.send_json({
                        "type": "audio",
                        "data": data.get("delta")
                    })
                    
                elif event_type == "conversation.item.input_audio_transcription.completed":
                    # User's speech transcription
                    transcript_text = data.get("transcript", "")
                    self.transcript.append(f"Caller: {transcript_text}")
                    await self.client_ws.send_json({
                        "type": "transcript",
                        "speaker": "caller",
                        "text": transcript_text
                    })
                    
                elif event_type == "response.audio_transcript.done":
                    # AI's speech transcription
                    transcript_text = data.get("transcript", "")
                    self.transcript.append(f"Persona: {transcript_text}")
                    await self.client_ws.send_json({
                        "type": "transcript",
                        "speaker": "persona",
                        "text": transcript_text
                    })
                    
                elif event_type == "response.done":
                    # Response completed
                    await self.client_ws.send_json({
                        "type": "response_complete"
                    })
                    
                elif event_type == "error":
                    # Error from OpenAI
                    await self.client_ws.send_json({
                        "type": "error",
                        "message": data.get("error", {}).get("message", "Unknown error")
                    })
                    break
                    
        except websockets.exceptions.ConnectionClosed:
            print("OpenAI WebSocket closed")
        except Exception as e:
            print(f"Error forwarding OpenAI to client: {e}")

