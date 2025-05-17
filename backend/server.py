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

# Get school details by ID
@app.get("/api/schools/{school_id}", response_model=Dict[str, Any])
async def get_school_details(school_id: int, db=Depends(get_db)):
    try:
        # Get school basic info
        school_result = db.execute(
            text("""
                SELECT d.id, d.name, d.address, d.phone, d.email, 
                       d.description, d.rating, s.name as state_name,
                       d.theory_course_price, d.parking_course_price, 
                       d.road_course_price, d.full_package_price, d.website, d.images
                FROM driving_schools d 
                JOIN states s ON d.state_id = s.id 
                WHERE d.id = :school_id
            """),
            {"school_id": school_id}
        )
        
        school_row = school_result.fetchone()
        if not school_row:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Driving school not found"}
            )
        
        images = school_row[13].split(',') if school_row[13] else []
        
        school = {
            "id": school_row[0],
            "name": school_row[1],
            "address": school_row[2],
            "phone": school_row[3],
            "email": school_row[4],
            "description": school_row[5],
            "rating": float(school_row[6]),
            "state_name": school_row[7],
            "theory_course_price": float(school_row[8]) if school_row[8] else 0.0,
            "parking_course_price": float(school_row[9]) if school_row[9] else 0.0,
            "road_course_price": float(school_row[10]) if school_row[10] else 0.0,
            "full_package_price": float(school_row[11]) if school_row[11] else 0.0,
            "website": school_row[12],
            "images": images,
            "teachers": [],
            "reviews": []
        }
        
        # Get teachers
        teachers_result = db.execute(
            text("""
                SELECT id, first_name, last_name, gender
                FROM users 
                WHERE role_id = 2 AND driving_school_id = :school_id
            """),
            {"school_id": school_id}
        )
        
        for row in teachers_result:
            school["teachers"].append({
                "id": row[0],
                "first_name": row[1],
                "last_name": row[2],
                "gender": row[3]
            })
        
        # Get reviews
        reviews_result = db.execute(
            text("""
                SELECT r.id, r.rating, r.comment, r.created_at,
                       u.first_name, u.last_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.driving_school_id = :school_id
                ORDER BY r.created_at DESC
            """),
            {"school_id": school_id}
        )
        
        for row in reviews_result:
            school["reviews"].append({
                "id": row[0],
                "rating": row[1],
                "comment": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "user_name": f"{row[4]} {row[5]}"
            })
        
        return school
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Get available sessions for a school and course
@app.get("/api/schools/{school_id}/sessions/{course_id}", response_model=List[Dict[str, Any]])
async def get_course_sessions(school_id: int, course_id: int, db=Depends(get_db)):
    try:
        result = db.execute(
            text("""
                SELECT id, session_date, start_time, end_time, 
                       zoom_link, max_participants, session_type
                FROM course_sessions
                WHERE driving_school_id = :school_id 
                AND course_id = :course_id
                AND session_date >= CURDATE()
                ORDER BY session_date, start_time
            """),
            {"school_id": school_id, "course_id": course_id}
        )
        
        sessions = []
        for row in result:
            sessions.append({
                "id": row[0],
                "session_date": row[1].isoformat() if row[1] else None,
                "start_time": str(row[2]) if row[2] else None,
                "end_time": str(row[3]) if row[3] else None,
                "zoom_link": row[4],
                "max_participants": row[5],
                "session_type": row[6]
            })
        
        return sessions
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Register student and enroll in course
@app.post("/api/enroll", response_model=Dict[str, Any])
async def enroll_student(enrollment_data: dict = Body(...), db=Depends(get_db)):
    try:
        # Extract data
        student_info = enrollment_data.get("student")
        enrollment_info = enrollment_data.get("enrollment")
        
        if not student_info or not enrollment_info:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": "Missing student or enrollment information"}
            )
        
        # Start a transaction
        conn = db.connection()
        
        # Check if user already exists
        user_result = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": student_info.get("email")}
        )
        
        user_row = user_result.fetchone()
        user_id = None
        
        if user_row:
            user_id = user_row[0]
        else:
            # Create new user
            db.execute(
                text("""
                    INSERT INTO users 
                    (username, email, password_hash, first_name, last_name, phone, gender, role_id, state_id)
                    VALUES (:username, :email, :password_hash, :first_name, :last_name, :phone, :gender, :role_id, :state_id)
                """), 
                {
                    "username": student_info.get("email").split("@")[0],
                    "email": student_info.get("email"),
                    "password_hash": student_info.get("password", "password123"),  # In production, this should be hashed
                    "first_name": student_info.get("first_name"),
                    "last_name": student_info.get("last_name"),
                    "phone": student_info.get("phone"),
                    "gender": student_info.get("gender"),
                    "role_id": 1,  # Student role
                    "state_id": student_info.get("state_id")
                }
            )
            
            user_id = conn.insert_id()
        
        # Create enrollment
        driving_school_id = enrollment_info.get("driving_school_id")
        course_id = enrollment_info.get("course_id")
        session_id = enrollment_info.get("session_id")
        payment_amount = enrollment_info.get("payment_amount")
        
        # Create enrollment entry
        db.execute(
            text("""
                INSERT INTO enrollments
                (user_id, course_id, driving_school_id, status)
                VALUES (:user_id, :course_id, :driving_school_id, 'pending')
            """),
            {
                "user_id": user_id,
                "course_id": course_id,
                "driving_school_id": driving_school_id
            }
        )
        
        enrollment_id = conn.insert_id()
        
        # If session provided, create session enrollment
        if session_id:
            db.execute(
                text("""
                    INSERT INTO session_enrollments
                    (user_id, course_session_id, payment_amount)
                    VALUES (:user_id, :session_id, :payment_amount)
                """),
                {
                    "user_id": user_id,
                    "session_id": session_id,
                    "payment_amount": payment_amount
                }
            )
            
            session_enrollment_id = conn.insert_id()
        else:
            session_enrollment_id = None
        
        db.commit()
        
        return {
            "message": "Enrollment created successfully",
            "user_id": user_id,
            "enrollment_id": enrollment_id,
            "session_enrollment_id": session_enrollment_id
        }
    
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Complete payment for enrollment
@app.post("/api/payments/{enrollment_id}", response_model=Dict[str, Any])
async def complete_payment(enrollment_id: int, payment_data: dict = Body(...), db=Depends(get_db)):
    try:
        # In a real system, we would process payment with a payment gateway here
        
        # Update session enrollment payment status
        db.execute(
            text("""
                UPDATE session_enrollments
                SET payment_status = 'completed', payment_date = NOW()
                WHERE id = :enrollment_id
            """),
            {"enrollment_id": enrollment_id}
        )
        
        # Get session details
        result = db.execute(
            text("""
                SELECT cs.session_date, cs.start_time, cs.end_time, cs.zoom_link,
                       c.name as course_name, c.type as course_type,
                       ds.name as school_name
                FROM session_enrollments se
                JOIN course_sessions cs ON se.course_session_id = cs.id
                JOIN courses c ON cs.course_id = c.id
                JOIN driving_schools ds ON cs.driving_school_id = ds.id
                WHERE se.id = :enrollment_id
            """),
            {"enrollment_id": enrollment_id}
        )
        
        session_row = result.fetchone()
        
        db.commit()
        
        if not session_row:
            return {
                "message": "Payment completed successfully, but session details not found"
            }
        
        return {
            "message": "Payment completed successfully",
            "session_details": {
                "course_name": session_row[4],
                "course_type": session_row[5],
                "school_name": session_row[6],
                "date": session_row[0].isoformat() if session_row[0] else None,
                "start_time": str(session_row[1]) if session_row[1] else None,
                "end_time": str(session_row[2]) if session_row[2] else None,
                "zoom_link": session_row[3]
            }
        }
    
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Database error: {str(e)}"}
        )

# Get student dashboard
@app.get("/api/students/{user_id}/dashboard", response_model=Dict[str, Any])
async def get_student_dashboard(user_id: int, db=Depends(get_db)):
    try:
        # Get student enrollments
        enrollments_result = db.execute(
            text("""
                SELECT e.id, e.course_id, e.status, c.name as course_name, c.type as course_type,
                       ds.id as school_id, ds.name as school_name
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                JOIN driving_schools ds ON e.driving_school_id = ds.id
                WHERE e.user_id = :user_id
            """),
            {"user_id": user_id}
        )
        
        enrollments = []
        for row in enrollments_result:
            enrollments.append({
                "id": row[0],
                "course_id": row[1],
                "status": row[2],
                "course_name": row[3],
                "course_type": row[4],
                "school_id": row[5],
                "school_name": row[6]
            })
        
        # Get upcoming sessions
        sessions_result = db.execute(
            text("""
                SELECT cs.id, cs.session_date, cs.start_time, cs.end_time, cs.zoom_link,
                       c.id as course_id, c.name as course_name, c.type as course_type,
                       ds.id as school_id, ds.name as school_name,
                       se.payment_status
                FROM session_enrollments se
                JOIN course_sessions cs ON se.course_session_id = cs.id
                JOIN courses c ON cs.course_id = c.id
                JOIN driving_schools ds ON cs.driving_school_id = ds.id
                WHERE se.user_id = :user_id
                AND cs.session_date >= CURDATE()
                ORDER BY cs.session_date, cs.start_time
            """),
            {"user_id": user_id}
        )
        
        upcoming_sessions = []
        for row in sessions_result:
            upcoming_sessions.append({
                "id": row[0],
                "session_date": row[1].isoformat() if row[1] else None,
                "start_time": str(row[2]) if row[2] else None,
                "end_time": str(row[3]) if row[3] else None,
                "zoom_link": row[4],
                "course_id": row[5],
                "course_name": row[6],
                "course_type": row[7],
                "school_id": row[8],
                "school_name": row[9],
                "payment_status": row[10]
            })
        
        # Get exams
        exams_result = db.execute(
            text("""
                SELECT id, course_id, score, status, exam_date
                FROM exams
                WHERE user_id = :user_id
                ORDER BY exam_date
            """),
            {"user_id": user_id}
        )
        
        exams = []
        for row in exams_result:
            exams.append({
                "id": row[0],
                "course_id": row[1],
                "score": float(row[2]) if row[2] else None,
                "status": row[3],
                "exam_date": row[4].isoformat() if row[4] else None
            })
        
        return {
            "enrollments": enrollments,
            "upcoming_sessions": upcoming_sessions,
            "exams": exams
        }
    
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
