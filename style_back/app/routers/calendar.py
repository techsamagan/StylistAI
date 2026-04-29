import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas import CalendarEvent
from app.database import get_db
from app.models import CalendarEventModel
from app.auth_utils import get_current_user_id

router = APIRouter(prefix="/calendar", tags=["calendar"])

_SEED_EVENTS = [
    {"id": "seed-1", "title": "Project Sync Meeting", "start": "2026-04-29T10:00", "end_time": "2026-04-29T11:00", "formality": "business_casual"},
    {"id": "seed-2", "title": "Gala Dinner", "start": "2026-04-30T19:00", "end_time": "2026-04-30T22:00", "formality": "formal"},
    {"id": "seed-3", "title": "Coffee with Sarah", "start": "2026-05-01T09:00", "end_time": "2026-05-01T10:00", "formality": "casual"},
    {"id": "seed-4", "title": "Board Presentation", "start": "2026-05-02T14:00", "end_time": "2026-05-02T15:30", "formality": "formal"},
]


def _seed_user(user_id: int, db: Session):
    if db.query(CalendarEventModel).filter(CalendarEventModel.user_id == user_id).count() > 0:
        return
    for e in _SEED_EVENTS:
        db.add(CalendarEventModel(user_id=user_id, **e))
    db.commit()


def _to_schema(e: CalendarEventModel) -> CalendarEvent:
    return CalendarEvent(id=e.id, title=e.title, start=e.start, end=e.end_time, formality=e.formality)


@router.get("/events", response_model=list[CalendarEvent])
def list_events(
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    if user_id:
        _seed_user(user_id, db)
    q = db.query(CalendarEventModel)
    if user_id:
        q = q.filter(CalendarEventModel.user_id == user_id)
    if date:
        q = q.filter(CalendarEventModel.start.like(f"{date}%"))
    return [_to_schema(e) for e in q.all()]


@router.post("/events", response_model=CalendarEvent, status_code=201)
def create_event(
    event: CalendarEvent,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    db_event = CalendarEventModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=event.title,
        start=event.start,
        end_time=event.end,
        formality=event.formality,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return _to_schema(db_event)


@router.delete("/events/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    event = db.query(CalendarEventModel).filter(CalendarEventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None
