import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="app-layout">
      
      {/* --- LEFT SIDE (IMAGE) --- */}
      <div className="visual-side">
        <img
          src="src/assests/images/login-bg.png"
          alt="StyloQ Background"
        />
        <div className="visual-overlay"></div>
        <div className="gradient-mask"></div>

        {/* --- BRANDING ON LEFT (Visible on Desktop) --- */}
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
          <p className="brand-tagline">Connecting grooming independence</p>
        </div>
      </div>

      {/* --- RIGHT SIDE (CONTENT) --- */}
      <div className="content-side" style={{overflow: "hidden", padding: "0"}}>
        
        {/* --- BRANDING ON RIGHT (Visible on Mobile Only) --- */}
        <div className="brand-content">
          <h1 className="brand-title">StyloQ</h1>
          <p className="brand-tagline">Connecting grooming independence</p>
        </div>

        {/* Buttons */}
        <div className="buttons-wrapper mobile-btn-wrapper">
          <Link to="/barber-home" className="btn btn-primary">SIGN IN</Link>
          <Link to="/signup-customer" className="btn btn-secondary">SIGN UP AS A CUSTOMER</Link>
          <Link to="/signup-barber" className="btn btn-secondary">SIGN UP AS A BARBER</Link>
          <Link to="/signup-salon" className="btn btn-secondary">SIGN UP AS A SALON</Link>
        </div>

        {/* Social Icons */}
          <div className="social-footer">
            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com/styloq99?igsh=MW5qbWNjazlmeXF4cg=="
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
            >
              <svg
                width="31"
                height="33"
                viewBox="0 0 31 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} 
              >
                <g clipPath="url(#clip0_instagram)">
                  <path
                    d="M22.6041 8.9375H22.6171M9.04165 2.75H21.9583C25.5252 2.75 28.4166 5.82804 28.4166 9.625V23.375C28.4166 27.172 25.5252 30.25 21.9583 30.25H9.04165C5.47481 30.25 2.58331 27.172 2.58331 23.375V9.625C2.58331 5.82804 5.47481 2.75 9.04165 2.75ZM20.6666 15.6337C20.8261 16.7781 20.6424 17.9468 20.1419 18.9736C19.6414 20.0005 18.8495 20.8332 17.8787 21.3533C16.908 21.8734 15.808 22.0544 14.735 21.8707C13.6621 21.6869 12.6709 21.1476 11.9025 20.3296C11.134 19.5116 10.6275 18.4565 10.4548 17.3143C10.2822 16.1721 10.4522 15.0011 10.9408 13.9678C11.4294 12.9344 12.2116 12.0914 13.1763 11.5586C14.1409 11.0258 15.2387 10.8303 16.3137 11C17.4103 11.1731 18.4254 11.717 19.2093 12.5514C19.9931 13.3858 20.504 14.4665 20.6666 15.6337Z"
                    stroke="#757575"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_instagram">
                    <rect width="31" height="33" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>

            {/* LinkedIn Icon */}
            <a
              href="https://www.linkedin.com/company/styloq/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="LinkedIn"
            >
              <svg
                width="30"
                height="33"
                viewBox="0 0 30 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 11C21.9891 11 23.8968 11.8692 25.3033 13.4164C26.7098 14.9635 27.5 17.062 27.5 19.25V28.875H22.5V19.25C22.5 18.5207 22.2366 17.8212 21.7678 17.3055C21.2989 16.7897 20.663 16.5 20 16.5C19.337 16.5 18.7011 16.7897 18.2322 17.3055C17.7634 17.8212 17.5 18.5207 17.5 19.25V28.875H12.5V19.25C12.5 17.062 13.2902 14.9635 14.6967 13.4164C16.1032 11.8692 18.0109 11 20 11Z"
                  stroke="#767676"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 12.375H2.5V28.875H7.5V12.375Z"
                  stroke="#767676"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 8.25C6.38071 8.25 7.5 7.01878 7.5 5.5C7.5 3.98122 6.38071 2.75 5 2.75C3.61929 2.75 2.5 3.98122 2.5 5.5C2.5 7.01878 3.61929 8.25 5 8.25Z"
                  stroke="#767676"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
      </div>
    </div>
  );
}
