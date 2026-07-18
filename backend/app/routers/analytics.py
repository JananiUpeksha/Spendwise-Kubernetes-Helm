import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Transaction, Category, Budget, TransactionType
from app.cache import redis_client

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/spending-by-category")
def spending_by_category(month: str, db: Session = Depends(get_db)):
    cache_key = f"spending_by_category:{month}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    results = (
        db.query(Category.name, func.sum(Transaction.amount).label("total"))
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(Transaction.type == TransactionType.expense)
        .filter(func.to_char(Transaction.date, 'YYYY-MM') == month)
        .group_by(Category.name)
        .all()
    )

    data = [{"category": r.name, "total": float(r.total)} for r in results]
    redis_client.setex(cache_key, 300, json.dumps(data))  # cache 5 minutes
    return data


@router.get("/budget-vs-actual")
def budget_vs_actual(month: str, db: Session = Depends(get_db)):
    cache_key = f"budget_vs_actual:{month}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    budgets = db.query(Budget).filter(Budget.month == month).all()

    result = []
    for b in budgets:
        spent = (
            db.query(func.sum(Transaction.amount))
            .filter(Transaction.category_id == b.category_id)
            .filter(Transaction.type == TransactionType.expense)
            .filter(func.to_char(Transaction.date, 'YYYY-MM') == month)
            .scalar()
        ) or 0
        result.append({
            "category_id": b.category_id,
            "category": b.category.name,
            "limit": float(b.limit_amount),
            "spent": float(spent),
        })

    redis_client.setex(cache_key, 300, json.dumps(result))
    return result


@router.get("/monthly-trend")
def monthly_trend(db: Session = Depends(get_db)):
    cache_key = "monthly_trend"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    results = (
        db.query(
            func.to_char(Transaction.date, 'YYYY-MM').label("month"),
            func.sum(Transaction.amount).label("total"),
        )
        .filter(Transaction.type == TransactionType.expense)
        .group_by("month")
        .order_by("month")
        .all()
    )

    data = [{"month": r.month, "total": float(r.total)} for r in results]
    redis_client.setex(cache_key, 300, json.dumps(data))
    return data
