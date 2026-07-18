from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional

class TransactionType(str, Enum):
    income = "income"
    expense = "expense"

# Category schemas
class CategoryCreate(BaseModel):
    name: str
    type: TransactionType

class CategoryOut(BaseModel):
    id: int
    name: str
    type: TransactionType

    class Config:
        from_attributes = True

# Transaction schemas
class TransactionCreate(BaseModel):
    amount: Decimal
    category_id: int
    date: date
    description: Optional[str] = None
    type: TransactionType

class TransactionOut(BaseModel):
    id: int
    amount: Decimal
    category_id: int
    date: date
    description: Optional[str] = None
    type: TransactionType

    class Config:
        from_attributes = True

# Budget schemas
class BudgetCreate(BaseModel):
    category_id: int
    month: str
    limit_amount: Decimal

class BudgetOut(BaseModel):
    id: int
    category_id: int
    month: str
    limit_amount: Decimal

    class Config:
        from_attributes = True
