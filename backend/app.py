from flask import Flask

# Load all models first
import backend.models

from backend.feed.routes import feed_bp
from backend.customer.routes import customer_bp, customer_feed_bp
from backend.auth.routes import auth_bp
from backend.salon.routes import salon_bp

from flask_cors import CORS

# Import barber blueprint - comment out AI for now to test
# from backend.ai.routes import ai_bp

try:
    from backend.barber.routes import barber_bp
    BARBER_BP_AVAILABLE = True
except Exception:
    BARBER_BP_AVAILABLE = False

from backend.models.base import Base, engine


def create_app():
    app = Flask(__name__)
    CORS(app)  # ✅ ADD THIS

    app.config["SECRET_KEY"] = "dev"

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
    
    if BARBER_BP_AVAILABLE:
        app.register_blueprint(barber_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)

    