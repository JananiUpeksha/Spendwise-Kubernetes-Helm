from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import categories, transactions, budgets, analytics

app = FastAPI(title="SpendWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(analytics.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
