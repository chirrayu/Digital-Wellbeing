import asyncio
import os
import sys
import argparse
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from core.events import event_bus
from core.models import ContentDetectedEvent

async def simulate_detection(file_path: str, platform: str = "YouTube", source_url: str = "https://youtube.com/watch?v=mock"):
    """
    Simulates a monitoring service finding a video/image and downloading it to a local file_path.
    Emits a CONTENT_DETECTED event.
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        return

    await event_bus.connect()
    
    event = ContentDetectedEvent(
        detection_id=str(uuid.uuid4()),
        source_url=source_url,
        platform=platform,
        file_path=file_path
    )
    
    await event_bus.publish("content.detected", event)
    print(f"Simulated detection emitted for {file_path} on {platform}.")
    
    await event_bus.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate content detection from a platform.")
    parser.add_argument("file_path", help="Path to the downloaded file to simulate detection")
    parser.add_argument("--platform", default="YouTube", help="Platform name (e.g. YouTube, TikTok)")
    parser.add_argument("--url", default="https://youtube.com/watch?v=mock", help="Source URL")
    
    args = parser.parse_args()
    
    asyncio.run(simulate_detection(args.file_path, args.platform, args.url))
