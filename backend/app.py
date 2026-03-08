from flask import Flask

# Load all models first
import backend.models

from backend.feed.routes import feed_bp
from backend.ai.routes import ai_bp

from backend.models.base import Base, engine


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "dev"

    # Create all tables after models are loaded
    Base.metadata.create_all(bind=engine)

    app.register_blueprint(ai_bp)
    app.register_blueprint(feed_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)