from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.models.activity import ActivityLog
from app.models.user import User

router = APIRouter(prefix="/activity", tags=["Activity Logs"])


@router.get("/")
def get_recent_activity(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Fetches the most recent activity logs for the logged-in user.
    """
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.timestamp.desc())
        .limit(limit)
        .all()
    )

    return logs
