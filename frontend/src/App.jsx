import "./global.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavouritesProvider } from "./pages/FavouritesContext.jsx";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUpBarber from "./pages/SignUpBarber.jsx";
import SignUpCustomer from "./pages/SignUpCustomer.jsx";
import VerificationStep1 from "./pages/VerificationStep1.jsx";
import VerificationStep2 from "./pages/VerificationStep2.jsx";
import SignUpBarberStep4 from "./pages/SignUpBarberStep4.jsx";
import SignUpBarberStep5 from "./pages/SignUpBarberStep5.jsx";
import SignUpBarberStep6 from "./pages/SignUpBarberStep6.jsx";
import SignUpBarberStep7 from "./pages/SignUpBarberStep7.jsx";
import SignUpBarberStep8 from "./pages/SignUpBarberStep8.jsx";
import SignUpSalon from "./pages/SignUpSalon.jsx";
import CreatePassword from "./pages/CreatePassword.jsx";
import CustomerHome from "./pages/CustomerHome.jsx";
import CustomerSearch from "./pages/CustomerSearch.jsx";
import AddReviewPage from "./pages/AddReviewPage.jsx";
import BarberProfileView from "./pages/BarberProfileView.jsx";
import CustomerProfile from "./pages/CustomerProfile.jsx";
import Favourites from "./pages/Favourites.jsx";
import BarberHomePage from "./pages/BarberHomePage.jsx";
<<<<<<< HEAD
=======
import AppointmentsOverview from "./pages/AppointmentsOverview.jsx";
>>>>>>> parent of c22d200 (Merge pull request #45 from styloq99-arch/main)
import Chatbot from "./pages/Chatbot";
import BookingPage from "./pages/BookingPage";

export default function App() {
  return (
    <BrowserRouter>
      {/* FavouritesProvider wraps all routes so CustomerHome and
          Favourites share the same bookmarked state */}
      <FavouritesProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />

          <Route path="/signup-barber" element={<SignUpBarber />} />
          <Route path="/signup-barber-step4" element={<SignUpBarberStep4 />} />
          <Route path="/signup-barber-step5" element={<SignUpBarberStep5 />} />
          <Route path="/signup-barber-step6" element={<SignUpBarberStep6 />} />
          <Route path="/signup-barber-step7" element={<SignUpBarberStep7 />} />
          <Route path="/signup-barber-step8" element={<SignUpBarberStep8 />} />

          <Route path="/signup-customer" element={<SignUpCustomer />} />
          <Route path="/verification-step1" element={<VerificationStep1 />} />
          <Route path="/verification-step2" element={<VerificationStep2 />} />
          <Route path="/create-password" element={<CreatePassword />} />

          <Route path="/signup-salon" element={<SignUpSalon />} />

          <Route path="/barber-home" element={<BarberHomePage />} />
<<<<<<< HEAD
=======
          <Route path="/Appointment-overview" element={<AppointmentsOverview />} />
>>>>>>> parent of c22d200 (Merge pull request #45 from styloq99-arch/main)

          <Route path="/customer-home" element={<CustomerHome />} />
          <Route path="/customer-search" element={<CustomerSearch />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/add-review" element={<AddReviewPage />} />
          <Route path="/barber-profile-view" element={<BarberProfileView />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/favourites" element={<Favourites />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </FavouritesProvider>
    </BrowserRouter>
  );
}
