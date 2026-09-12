from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Load
from app.schemas.loads import LoadCreate, LoadUpdate, LoadResponse

router = APIRouter(prefix="/loads", tags=["Flexible Loads"])


@router.get("", response_model=List[LoadResponse])
def get_loads(db: Session = Depends(get_db)):
    """
    List all facility loads including critical, flexible, and highly flexible equipment.
    """
    return db.query(Load).filter(Load.is_active == True).all()


@router.post("", response_model=LoadResponse, status_code=status.HTTP_201_CREATED)
def create_load(load_in: LoadCreate, db: Session = Depends(get_db)):
    """
    Register a new facility load.
    Rules: Critical loads are enforced with shiftable=False.
    """
    # Enforce non-shiftability on critical loads
    is_shiftable = False if load_in.priority == "critical" else load_in.shiftable

    db_load = Load(
        name=load_in.name,
        power_kw=load_in.power_kw,
        duration_hours=load_in.duration_hours,
        earliest_start=load_in.earliest_start,
        latest_end=load_in.latest_end,
        priority=load_in.priority,
        shiftable=is_shiftable,
        is_active=True,
    )
    db.add(db_load)
    db.commit()
    db.refresh(db_load)
    return db_load


@router.put("/{load_id}", response_model=LoadResponse)
def update_load(load_id: int, load_in: LoadUpdate, db: Session = Depends(get_db)):
    """
    Update load parameters (power, duration, time window, priority, shiftability).
    """
    db_load = db.query(Load).filter(Load.id == load_id, Load.is_active == True).first()
    if not db_load:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Load with ID {load_id} not found",
        )

    update_data = load_in.model_dump(exclude_unset=True)

    # Priority / critical constraint enforcement
    new_priority = update_data.get("priority", db_load.priority)
    if new_priority == "critical":
        update_data["shiftable"] = False

    for field, val in update_data.items():
        setattr(db_load, field, val)

    db.commit()
    db.refresh(db_load)
    return db_load


@router.delete("/{load_id}", status_code=status.HTTP_200_OK)
def delete_load(load_id: int, db: Session = Depends(get_db)):
    """
    Deactivate / delete a facility load by ID.
    """
    db_load = db.query(Load).filter(Load.id == load_id, Load.is_active == True).first()
    if not db_load:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Load with ID {load_id} not found",
        )

    # Soft delete
    db_load.is_active = False
    db.commit()
    return {"message": f"Load {load_id} deleted successfully", "id": load_id}
