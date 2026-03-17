import os
import sys
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
from flask import Flask

# Load all models first
from models import base
from models.barber import Barber
from models.booking import Booking, Availability
from models.social import Post
from models.barber_portfolio import BarberPortfolio
from models.salon import SalonBarberAssociation, SalonAvailability

from feed.routes import feed_bp
from customer.routes import customer_bp, customer_feed_bp
from auth.routes import auth_bp
from salon.routes import salon_bp

# Import barber blueprint - comment out AI for now to test
# from ai.routes import ai_bp
# from barber.routes import barber_bp
from barber.routes import barber_bp

from backend.models.base import Base, engine


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "dev"
    app.config["JWT_SECRET_KEY"] = "jwt-secret-key-change-in-production"

    # Create all tables after models are loaded
    Base.metadata.create_all(bind=engine)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(customer_feed_bp)
    app.register_blueprint(salon_bp)
    # app.register_blueprint(ai_bp)
    app.register_blueprint(barber_bp, url_prefix='/barber')

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)

