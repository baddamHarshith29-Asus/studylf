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
