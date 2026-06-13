import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Local Revision Hub API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatPayload(BaseModel):
    prompt: str

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "system": "FastAPI Connected"}


@app.post("/api/ai/chat")
async def chat_with_agent(payload: ChatPayload):
    ollama_url = "http://localhost:11434/api/generate"

    request_data = {
        "model": "phi3:mini",
        "prompt": payload.prompt,
        "stream": False 
    }
    

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(ollama_url, json=request_data)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Ollama error")
            

            result = response.json()
            return {"response": result.get("response"), "model": "phi3:mini"}
            
        except httpx.ConnectError:
            raise HTTPException(
                status_code=503, 
                detail="Could not connect to Ollama. Is the service running?"
            )