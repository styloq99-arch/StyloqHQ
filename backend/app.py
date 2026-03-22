from flask import Flask
import os

# Load all models first
import models

from feed.routes import feed_bp
from customer.routes import customer_bp, customer_feed_bp
from auth.routes import auth_bp
from salon.routes import salon_bp

from flask_cors import CORS

# Import Messaging routes
from message.routes import message_bp

# Import AI routes
from ai.routes import ai_bp

try:
    from barber.routes import barber_bp
    BARBER_BP_AVAILABLE = True
except Exception:
    BARBER_BP_AVAILABLE = False

from models.base import Base, engine


def create_app():
    app = Flask(__name__)
    
    # Get allowed origins from environment variable, default to everything for development
    cors_origin = os.environ.get("CORS_ORIGIN", "*")
    origins_list = [origin.strip() for origin in cors_origin.split(",")] if cors_origin != "*" else "*"

    CORS(
        app,
        origins=origins_list,
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    app.config["SECRET_KEY"] = "dev"

    app.config["SECRET_KEY"] = "dev"
    app.config["JWT_SECRET_KEY"] = "jwt-secret-key-change-in-production"

    # Create all tables after models are loaded
    Base.metadata.create_all(bind=engine)

    # Register blueprints
    app.register_blueprint(auth_bp)
    # feed_bp removed — customer_feed_bp at /feed handles all feed routes
    # app.register_blueprint(feed_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(customer_feed_bp)
    app.register_blueprint(salon_bp)
    
    if BARBER_BP_AVAILABLE:
        app.register_blueprint(barber_bp)
        
    app.register_blueprint(ai_bp)
    app.register_blueprint(message_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)

    