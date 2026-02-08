from flask import Flask
from extensions import db

from ai.routes import ai_bp
from feed.routes import feed_bp

def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "dev"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///styloq.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.register_blueprint(ai_bp)

    db.init_app(app)

    app.register_blueprint(feed_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
