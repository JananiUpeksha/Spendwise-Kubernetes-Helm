from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Transaction
from app.schemas import TransactionCreate, TransactionOut
from app.cache import redis_client

router = APIRouter(prefix="/transactions", tags=["transactions"])

def clear_analytics_cache():
    for key in redis_client.scan_iter("spending_by_category:*"):
        redis_client.delete(key)
    for key in redis_client.scan_iter("budget_vs_actual:*"):
        redis_client.delete(key)
    redis_client.delete("monthly_trend")

@router.post("/", response_model=TransactionOut)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    clear_analytics_cache()
    return db_transaction

@router.get("/", response_model=list[TransactionOut])
def list_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.date.desc()).all()

@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for key, value in transaction.model_dump().items():
        setattr(db_transaction, key, value)
    db.commit()
    db.refresh(db_transaction)
    clear_analytics_cache()
    return db_transaction

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(db_transaction)
    db.commit()
    clear_analytics_cache()
    return {"detail": "Transaction deleted"}
