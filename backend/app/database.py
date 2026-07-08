from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# SQLite needs check_same_thread=False to work with FastAPI's threaded request
# handling. It's kept here (rather than removed outright) because tests/conftest.py
# deliberately points DATABASE_URL at a local SQLite file for fast, isolated
# test runs — production and local dev both use Postgres via the default in
# config.py.
connect_args = {"check_same_thread": False} if is_sqlite else {}

# pool_pre_ping issues a lightweight "is this connection still alive" check
# before handing it out, so a connection Postgres has silently closed after
# sitting idle (common with managed Postgres and behind load balancers)
# fails over to a fresh one instead of surfacing as a random request error.
# SQLite has no such connection-pool-goes-stale failure mode, so it's a
# no-op there rather than a meaningful setting.
# engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()




# 1. Normalize connection string (Handles differences between old/new hosting standards)
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# 2. Production-grade engine configuration optimized for PostgreSQL
engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=15,
    max_overflow=25
)

# 3. Create session factory for FastAPI requests
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Declarative base for your database models
Base = declarative_base()

# 5. FastAPI Context Manager Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
