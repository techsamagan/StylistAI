from fastapi import APIRouter, HTTPException
from app.schemas import CalendarEvent
import uuid

router = APIRouter(prefix="/calendar", tags=["calendar"])

# In-memory events (replace with real calendar sync later)
_events: list[dict] = [
    {"id": "1", "title": "Project Sync Meeting", "start": "2026-03-24T10:00", "end": "2026-03-24T11:00", "formality": "business_casual"},
    {"id": "2", "title": "Gala Dinner", "start": "2026-03-25T19:00", "end": "2026-03-25T22:00", "formality": "formal"},
    {"id": "3", "title": "Coffee with Sarah", "start": "2026-03-26T09:00", "end": "2026-03-26T10:00", "formality": "casual"},
    {"id": "4", "title": "Board Presentation", "start": "2026-03-27T14:00", "end": "2026-03-27T15:30", "formality": "formal"},
]


@router.get("/events", response_model=list[CalendarEvent])
def list_events(date: str | None = None):
    """List calendar events. Optional ?date=YYYY-MM-DD filter."""
    events = [CalendarEvent(**e) for e in _events]
    if date:
        events = [e for e in events if e.start.startswith(date)]
    return events


@router.post("/events", response_model=CalendarEvent, status_code=201)
def create_event(event: CalendarEvent):
    """Add a new calendar event."""
    new_event = event.model_dump()
    new_event["id"] = str(uuid.uuid4())
    _events.append(new_event)
    return CalendarEvent(**new_event)


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: str):
    """Delete a calendar event."""
    global _events
    before = len(_events)
    _events = [e for e in _events if e["id"] != event_id]
    if len(_events) == before:
        raise HTTPException(status_code=404, detail="Event not found")
    return None
