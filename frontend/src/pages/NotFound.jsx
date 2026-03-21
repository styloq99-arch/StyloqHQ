import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-brand-cream">404</h1>
        <p className="text-xl text-brand-cream/80 mb-4">Oops! Page not found</p>
        <button 
          onClick={() => navigate(-1)} 
          className="text-brand-orange hover:text-brand-orange/80 underline"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
