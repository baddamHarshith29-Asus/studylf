from backend.core.logger import logger
from backend.core.constants import (
    DEFAULT_FUNDING_SCHEMES, DEFAULT_INVESTORS, DEFAULT_MENTORS, DEFAULT_RESOURCES, DEFAULT_RADAR_ITEMS
)

def seed_initial_data():
    # Import the already initialized database instance (which handles live vs mock fallback)
    from backend.core.database import db
    try:
        # Create indexes
        logger.info("Initializing MongoDB indexes...")
        db.users.create_index("email", unique=True)
        db.profiles.create_index("user_id", unique=True)
        db.profiles.create_index("slug", unique=True, sparse=True)
        db.validation_reports.create_index("id", unique=True)
        db.roadmap_tasks.create_index("id", unique=True)
        db.saved_storyboards.create_index("user_id", unique=True)
        db.funding_schemes.create_index("id", unique=True)
        db.applications.create_index("id", unique=True)
        db.radar_items.create_index("id", unique=True)
        db.investors.create_index("id", unique=True)
        db.mentors.create_index("id", unique=True)
        db.contacts.create_index("id", unique=True)
        db.resources.create_index("id", unique=True)
        db.activity_logs.create_index("id", unique=True)
        db.job_opportunities.create_index("id", unique=True)
        db.job_applications.create_index("id", unique=True)
        
        # Seeding logic
        # 0. Seed Admin User
        admin_email = "admin@studlyf.com"
        admin_doc = db.users.find_one({"email": admin_email})
        if not admin_doc:
            logger.info("Seeding default admin user...")
            from backend.core.security import hash_password
            import time
            hashed = hash_password("adminpassword")
            datetime_now = time.time()
            admin_user_dict = {
                "email": admin_email,
                "name": "Studlyf Admin",
                "password_hash": hashed,
                "is_verified": True,
                "google_user": False,
                "is_admin": True,
                "created_at": datetime_now
            }
            res = db.users.insert_one(admin_user_dict)
            admin_uid = str(res.inserted_id)
            
            # Seed admin profile
            db.profiles.insert_one({
                "user_id": admin_uid,
                "registered": True, # Direct access enabled!
                "is_public": False,
                "startup_name": "Studlyf Operations",
                "description": "Platform administration and operations workspace.",
                "industry": "AI & SaaS",
                "country": "India",
                "stage": "MVP",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "created_at": datetime_now,
                "updated_at": datetime_now
            })
            
            # Seed founder profile
            db.founder_profiles.insert_one({
                "user_id": admin_uid,
                "name": "Studlyf Admin",
                "email": admin_email,
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "created_at": datetime_now
            })
            
            # Seed startup record
            db.startups.insert_one({
                "user_id": admin_uid,
                "startup_name": "Studlyf Operations",
                "industry": "AI & SaaS",
                "stage": "MVP",
                "is_public": False,
                "created_at": datetime_now
            })
            logger.info("Successfully seeded admin user and profile.")

        # 1. Seed Funding Schemes
        if db.funding_schemes.count_documents({}) == 0:
            logger.info("Seeding default funding schemes...")
            db.funding_schemes.insert_many(DEFAULT_FUNDING_SCHEMES)
            
        # 2. Seed Investors
        if db.investors.count_documents({}) == 0:
            logger.info("Seeding default investors...")
            db.investors.insert_many(DEFAULT_INVESTORS)
            
        # 3. Seed Mentors
        if db.mentors.count_documents({}) == 0:
            logger.info("Seeding default mentors...")
            db.mentors.insert_many(DEFAULT_MENTORS)
            
        # 4. Seed Resources
        if db.resources.count_documents({}) == 0:
            logger.info("Seeding default library resources...")
            db.resources.insert_many(DEFAULT_RESOURCES)
            
        # 5. Seed Radar Items
        if db.radar_items.count_documents({}) == 0:
            logger.info("Seeding default news radar items...")
            db.radar_items.insert_many(DEFAULT_RADAR_ITEMS)
            
        logger.info("MongoDB seeding verification complete.")
    except Exception as e:
        logger.error(f"Error seeding MongoDB: {str(e)}")

if __name__ == "__main__":
    seed_initial_data()
