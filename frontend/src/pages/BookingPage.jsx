import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import CustomerSidebar from '../Components/CustomerSidebar';
import { apiPost } from '../utils/api';

export default function BookingPage() {
  const navigate = useNavigate();
  const { barberId } = useParams();

  const LOCATIONS = [
    "Liyo Salon (pvt) Ltd",
    "Salon Next (pvt) Ltd",
    "Colombo City Center Branch"
  ];

  const SERVICE_CATALOG = {
    Male: {
      "Beard Services": [
        { id: 4, name: "FULL BEARD", price: "Rs.800.00", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop&crop=top" },
        { id: 5, name: "BEARD TRIM", price: "Rs.600.00", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop&crop=top" },
        { id: 6, name: "HOT SHAVE", price: "Rs.1000.00", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&h=300&fit=crop&crop=top" },
      ],
    },
    Female: {
      "Hair Services": [
        { id: 10, name: "BLOW DRY", price: "Rs.1800.00", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop&crop=top" },
        { id: 11, name: "HAIR TRIM", price: "Rs.1200.00", img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=300&h=300&fit=crop&crop=top" },
        { id: 12, name: "UP-DO", price: "Rs.2500.00", img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=300&fit=crop&crop=top" },
      ],
      "Hair Coloring": [
        { id: 13, name: "FULL COLOR", price: "Rs.4500.00", img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=300&fit=crop&crop=top" },
        { id: 14, name: "HIGHLIGHTS", price: "Rs.3500.00", img: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=300&h=300&fit=crop&crop=top" },
        { id: 15, name: "BALAYAGE", price: "Rs.5000.00", img: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=300&h=300&fit=crop&crop=top" },
      ],
      "Keratin Treatment": [
        { id: 16, name: "KERATIN", price: "Rs.4500.00", img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=300&h=300&fit=crop&crop=top" },
        { id: 17, name: "SMOOTHING", price: "Rs.3800.00", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=top" },
        { id: 18, name: "BOTOX HAIR", price: "Rs.5500.00", img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=300&fit=crop&crop=top" },
      ],
    },
  };

  const SERVICE_TYPES = {
    Male: ["Beard Services"],
    Female: ["Hair Services", "Hair Coloring", "Keratin Treatment"],
  };

  const TIME_SLOTS = [
    "9.00 AM", "10.00 AM", "11.00 AM", "12.00 PM",
    "1.00 PM", "2.00 PM", "3.00 PM", "4.00 PM", "5.00 PM"
  ];

  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedGender, setSelectedGender] = useState("Male");
  const [selectedServiceType, setSelectedServiceType] = useState("Beard Services");
  const [selectedService, setSelectedService] = useState(null);
  const [preferences, setPreferences] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState("Pay On Visit");
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState(1);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const [bookingError, setBookingError] = useState('');

  const handleConfirmBooking = async () => {
    if (!selectedService) { alert("Please select a service type."); return; }
    if (!selectedTime) { alert("Please select a time slot."); return; }
    if (!selectedDate) { alert("Please select a valid date."); return; }
    setIsBooking(true);
    setBookingError('');
    try {
      const res = await apiPost('/customers/bookings', {
        barber_id: barberId || 1,
        service_id: selectedService,
        appointment_datetime: `${selectedDate}T${selectedTime}`,
        location: selectedLocation,
        payment_method: paymentMethod,
      });
      if (res.success) {
        setStep(2);
      } else {
        setBookingError(res.message || 'Booking failed');
      }
    } catch (err) {
      setBookingError('Network error. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const SERVICES = (SERVICE_CATALOG[selectedGender] || {})[selectedServiceType] || [];

  const getServiceDetails = () =>
    Object.values(SERVICE_CATALOG)
      .flatMap(g => Object.values(g).flat())
      .find(s => s.id === selectedService);

  /* ─── Step 2: Booking Confirmed ─── */
  if (step === 2) {
    const service = getServiceDetails();
    return (
      <div className="app-layout">
        <CustomerSidebar activePage="Search" />

        <div className="main-content bp-confirmed-wrapper">
          <div className="bp-confirmed-icon">
            <i className="fas fa-check"></i>
          </div>
          <h2 className="bp-confirmed-title">Booking Confirmed!</h2>
          <p className="bp-confirmed-subtitle">Your appointment has been scheduled successfully.</p>

          <div className="bp-confirmed-card">
            <div className="bp-confirmed-card-header">
              <p>Barber</p>
              <p>S.S.K.Perera</p>
            </div>
            {[
              ['Service', service?.name],
              ['Date', selectedDate],
              ['Time', selectedTime],
              ['Payment', paymentMethod],
            ].map(([label, val]) => (
              <div key={label} className="bp-confirmed-row">
                <span>{label}</span>
                <span>{val}</span>
              </div>
            ))}
            <div className="bp-confirmed-total">
              <span className="bp-confirmed-total-label">Total</span>
              <span className="bp-confirmed-total-price">{service?.price}</span>
            </div>
          </div>

          <button className="bp-confirmed-home-btn" onClick={() => navigate('/home')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  /* ─── Step 1: Booking Form ─── */
  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <CustomerSidebar activePage="Search" />

      {/* Main Content */}
      <div className="main-content booking-page">

        {/* Hero Banner */}
        <div className="bp-hero">
          <img
            src="src/assests/images/booking_pg.jpg"
            alt="Barbershop"
            className="bp-hero-img"
          />
          <div className="bp-hero-overlay"></div>
          <button className="bp-back-btn" onClick={() => window.history.back()}>
            <i className="fas fa-chevron-left"></i>
          </button>

          <div className="bp-hero-title">Booking Appointments</div>
        </div>

        {/* Barber Profile */}
        <div className="bp-profile">
          <div className="bp-avatar-wrap">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Barber"
              className="bp-avatar"
            />
            <div className="bp-avatar-ring"></div>
          </div>
          <div className="bp-profile-info">
            <h3>S.S.K.Perera</h3>
            <p className="bp-exp">17 years of experience</p>
            <p className="bp-bio">Fresh fades • Clean shaves • Good vibes. Crafting confidence one cut at a time</p>
          </div>
        </div>

        <div className="bp-divider-line"></div>

        {/* Gender */}
        <div className="bp-gender-section">
          <div className="bp-gender-label">Gender</div>
          <div className="bp-gender-row">
            {['Male', 'Female'].map(g => (
              <div
                key={g}
                className={`bp-gender-opt ${selectedGender === g ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGender(g);
                  setSelectedService(null);
                  setSelectedServiceType(SERVICE_TYPES[g][0]);
                }}
              >
                <div className="bp-radio-outer">
                  <div className="bp-radio-inner"></div>
                </div>
                {g}
              </div>
            ))}
          </div>
        </div>

        {/* Service Type - Male */}
        {selectedGender === 'Male' && (
          <div className="bp-haircut-section">
            <div className="bp-haircut-header">
              <span className="bp-haircut-title">Select</span>
              <button className="bp-view-all">View All</button>
            </div>
            <div className="bp-haircut-cards">
              {SERVICES.map(service => (
                <div
                  key={service.id}
                  className={`bp-haircut-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <img src={service.img} alt={service.name} />
                  <div className="bp-haircut-card-info">
                    <div className="bp-haircut-name">{service.name}</div>
                    <div className="bp-haircut-price">{service.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Type - Female */}
        {selectedGender === 'Female' && (
          <>
            <div className="bp-service-type-row">
              <span className="bp-service-type-label">Service Type</span>
              <select
                className="bp-service-dropdown"
                value={selectedServiceType}
                onChange={e => { setSelectedServiceType(e.target.value); setSelectedService(null); }}
              >
                {SERVICE_TYPES[selectedGender].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="bp-haircut-section">
              <div className="bp-haircut-header">
                <span className="bp-haircut-title">Select</span>
                <button className="bp-view-all">View All</button>
              </div>
              <div className="bp-haircut-cards">
                {SERVICES.map(service => (
                  <div
                    key={service.id}
                    className={`bp-haircut-card ${selectedService === service.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <img src={service.img} alt={service.name} />
                    <div className="bp-haircut-card-info">
                      <div className="bp-haircut-name">{service.name}</div>
                      <div className="bp-haircut-price">{service.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="bp-others-section">
          <div className="bp-others-title">Others</div>
          <div className="bp-others-row">
            <div className="bp-upload-box">
              <input
                type="file"
                id="photoUpload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*"
              />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="bp-upload-preview" />
              )}
              <label htmlFor="photoUpload" className="bp-upload-label">
                <i className="fas fa-camera"></i>
                Upload Photo
              </label>
            </div>
            <textarea
              className="bp-pref-textarea"
              placeholder="Describe your Preference..."
              rows={4}
              value={preferences}
              onChange={e => setPreferences(e.target.value)}
            />
          </div>
        </div>

        {/* Scheduling */}
        <div className="bp-schedule-section">
          <label className="bp-sched-label">Select Your Date</label>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bp-sched-input"
          />

          <label className="bp-sched-label">Select Salon Location</label>
          <select
            className="bp-sched-input"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            {LOCATIONS.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>

          <label className="bp-sched-label">Available Slots</label>
          <div className="bp-time-grid">
            {TIME_SLOTS.map((time, idx) => (
              <div
                key={idx}
                className={`bp-time-chip ${selectedTime === time ? 'active' : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </div>
            ))}
          </div>

          <label className="bp-sched-label">Payment Options</label>
          <div className="bp-pay-row">
            {[
              { key: 'Pay On Visit', icon: 'fa-wallet' },
              { key: 'Pay Online', icon: 'fa-credit-card' },
            ].map(({ key, icon }) => (
              <div
                key={key}
                className={`bp-pay-card ${paymentMethod === key ? 'selected' : ''}`}
                onClick={() => setPaymentMethod(key)}
              >
                <div className="bp-pay-dot"></div>
                <i className={`fas ${icon}`}></i>
                <span>{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          className="bp-continue-btn"
          onClick={handleConfirmBooking}
          disabled={isBooking}
        >
          {isBooking
            ? <><i className="fas fa-circle-notch fa-spin"></i> Processing...</>
            : 'Continue'
          }
        </button>

        <div style={{ height: '80px' }}></div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item"><i className="fas fa-home"></i>  <span>Home</span></Link>
        <Link to="/customer-search" className="nav-item active"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
        <Link to="/message" className="nav-item"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/customer-profile" className="nav-item"><i className="fas fa-user"></i>  <span>Profile</span></Link>
      </nav>
    </div>
  );
}
