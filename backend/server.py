from fastapi import FastAPI, Depends, HTTPException, status, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, validator
import os
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pymysql
from datetime import datetime, date, time
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Database connection
MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_USER = os.environ.get("MYSQL_USER", "drivingadmin")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "password123")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "driving_school_db")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Models
class DrivingSchoolBase(BaseModel):
    name: str
    address: str
    phone: str
    email: EmailStr
    description: Optional[str] = None
    state_id: int

class DrivingSchoolCreate(DrivingSchoolBase):
    pass

class DrivingSchool(DrivingSchoolBase):
    id: int
    rating: float = 0.0
    created_at: datetime

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    gender: str
    role_id: int
    state_id: int
    driving_school_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class StateBase(BaseModel):
    name: str
    code: str

class State(StateBase):
    id: int

    class Config:
        orm_mode = True

class CourseBase(BaseModel):
    name: str
    description: str
    type: str
    sequence_order: int

class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True

# API routes
@app.get("/api")
def read_root():
    return {"message": "Welcome to Driving School Management API"}

# Get all states
@app.get("/api/states", response_model=List[Dict[str, Any]])
async def get_states(db=Depends(get_db)):
    try:
        result = db.execute(text("SELECT id, name, code FROM states"))
        states = [{"id": row[0], "name": row[1], "code": row[2]} for row in result]
        return states
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Get schools by state
@app.get("/api/schools/by-state/{state_id}", response_model=List[Dict[str, Any]])
async def get_schools_by_state(state_id: int, db=Depends(get_db)):
    try:
        result = db.execute(
            text("""
                SELECT d.id, d.name, d.address, d.phone, d.email, 
                       d.description, d.rating, s.name as state_name,
                       d.theory_course_price, d.parking_course_price, 
                       d.road_course_price, d.full_package_price, d.images
                FROM driving_schools d 
                JOIN states s ON d.state_id = s.id 
                WHERE d.state_id = :state_id
            """),
            {"state_id": state_id}
        )
        
        schools = []
        for row in result:
            images = row[12].split(',') if row[12] else []
            schools.append({
                "id": row[0],
                "name": row[1],
                "address": row[2],
                "phone": row[3],
                "email": row[4],
                "description": row[5],
                "rating": float(row[6]),
                "state_name": row[7],
                "theory_course_price": float(row[8]) if row[8] else 0.0,
                "parking_course_price": float(row[9]) if row[9] else 0.0,
                "road_course_price": float(row[10]) if row[10] else 0.0,
                "full_package_price": float(row[11]) if row[11] else 0.0,
                "images": images
            })
        
        return schools
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Register a new driving school
@app.post("/api/schools/register", response_model=Dict[str, Any])
async def register_school(school_data: dict = Body(...), db=Depends(get_db)):
    try:
        # Extract school and user data
        school_info = school_data.get("school")
        manager_info = school_data.get("manager")
        
        if not school_info or not manager_info:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": "Missing school or manager information"}
            )
        
        # Start a transaction
        conn = db.connection()
        
        # Insert driving school
        result = db.execute(
            text("""
                INSERT INTO driving_schools 
                (name, address, phone, email, description, state_id)
                VALUES (:name, :address, :phone, :email, :description, :state_id)
            """), 
            {
                "name": school_info.get("name"),
                "address": school_info.get("address"),
                "phone": school_info.get("phone"),
                "email": school_info.get("email"),
                "description": school_info.get("description", ""),
                "state_id": school_info.get("state_id")
            }
        )
        
        school_id = conn.insert_id()
        
        # Insert manager
        db.execute(
            text("""
                INSERT INTO users 
                (username, email, password_hash, first_name, last_name, phone, gender, role_id, driving_school_id, state_id)
                VALUES (:username, :email, :password_hash, :first_name, :last_name, :phone, :gender, :role_id, :driving_school_id, :state_id)
            """), 
            {
                "username": manager_info.get("username"),
                "email": manager_info.get("email"),
                "password_hash": manager_info.get("password"),  # In production, this should be hashed
                "first_name": manager_info.get("first_name"),
                "last_name": manager_info.get("last_name"),
                "phone": manager_info.get("phone"),
                "gender": manager_info.get("gender"),
                "role_id": 3,  # Manager role
                "driving_school_id": school_id,
                "state_id": school_info.get("state_id")
            }
        )
        
        db.commit()
        
        return {
            "message": "Driving school registered successfully",
            "school_id": school_id
        }
    
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Get courses
@app.get("/api/courses", response_model=List[Dict[str, Any]])
async def get_courses(db=Depends(get_db)):
    try:
        result = db.execute(text("SELECT id, name, description, type, sequence_order FROM courses"))
        courses = [
            {
                "id": row[0], 
                "name": row[1], 
                "description": row[2],
                "type": row[3],
                "sequence_order": row[4]
            } for row in result
        ]
        return courses
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Startup event to connect to the database
@app.on_event("startup")
def startup_db_client():
    try:
        # Test the database connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Connected to MySQL database!")
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
        raise

# Shutdown event to close the database connection
@app.on_event("shutdown")
def shutdown_db_client():
    SessionLocal().close_all()
    print("Database connection closed.")
