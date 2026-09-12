from sqlalchemy.orm import Session
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.models import Facility, Load, User


def init_db(db: Session = None) -> None:
    """Initializes the database schema and seeds demo facility loads."""
    Base.metadata.create_all(bind=engine)

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # Check if default facility exists
        facility = db.query(Facility).first()
        if not facility:
            # Create demo user
            demo_user = User(
                email="admin@reflow.ai",
                name="RE-FLOW Energy Admin",
                role="facility_manager"
            )
            db.add(demo_user)
            db.flush()

            # Create default facility
            facility = Facility(
                name="Gandhinagar Clean Tech Industrial Campus",
                location="Gandhinagar, Gujarat, India",
                latitude=23.2156,
                longitude=72.6369,
                base_load_kw=350.0,
                solar_capacity_kw=1200.0,
                wind_capacity_kw=200.0,
                owner_id=demo_user.id,
            )
            db.add(facility)
            db.flush()

        # Check if default loads exist
        existing_loads_count = db.query(Load).count()
        if existing_loads_count == 0:
            initial_loads = [
                Load(
                    facility_id=facility.id,
                    name="EV Fleet Charging",
                    power_kw=150.0,
                    duration_hours=3,
                    earliest_start="11:00",
                    latest_end="16:00",
                    priority="highly_flexible",
                    shiftable=True,
                ),
                Load(
                    facility_id=facility.id,
                    name="HVAC Pre-Cooling System",
                    power_kw=220.0,
                    duration_hours=4,
                    earliest_start="10:00",
                    latest_end="15:00",
                    priority="flexible",
                    shiftable=True,
                ),
                Load(
                    facility_id=facility.id,
                    name="Wastewater Pump Station",
                    power_kw=90.0,
                    duration_hours=3,
                    earliest_start="09:00",
                    latest_end="17:00",
                    priority="highly_flexible",
                    shiftable=True,
                ),
                Load(
                    facility_id=facility.id,
                    name="Battery Energy Storage System (BESS) Charge",
                    power_kw=250.0,
                    duration_hours=3,
                    earliest_start="11:00",
                    latest_end="15:00",
                    priority="flexible",
                    shiftable=True,
                ),
                Load(
                    facility_id=facility.id,
                    name="Critical Server Room & Life Safety",
                    power_kw=180.0,
                    duration_hours=24,
                    earliest_start="00:00",
                    latest_end="23:00",
                    priority="critical",
                    shiftable=False,  # Critical loads must NEVER be shifted!
                ),
            ]
            db.add_all(initial_loads)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during init_db: {e}")
        raise
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    print("Initializing RE-FLOW AI database...")
    init_db()
    print("Database tables created and seeded successfully.")
