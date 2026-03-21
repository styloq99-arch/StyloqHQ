import "./global.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FavouritesProvider } from "./pages/FavouritesContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUpBarber from "./pages/SignUpBarber.jsx";
import SignUpCustomer from "./pages/SignUpCustomer.jsx";
import SignUpCustomerFinal from "./pages/SignUpCustomerFinal.jsx";
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
import AppointmentOverview from "./pages/AppointmentOverview.jsx";
import BarberDashboard from "./pages/BarberDashboard.jsx";
import SalonDashboard from "./pages/SalonDashboard.jsx";
import PostingPhotos from "./pages/PostingPhots.jsx";
import SharePost from "./pages/SharePost.jsx";
import BarberVacanciesPage from "./pages/BarberVacanciesPage.jsx";
import BarberApplicationsPage from "./pages/BarberApplicationsPage.jsx";
import SalonHomePage from "./pages/SalonHomePage.jsx";
import SalonHirePage from "./pages/SalonHirePage.jsx";
import SalonProfilePage from "./pages/SalonProfilePage.jsx";
import BarberOwnProfile from "./pages/BarberOwnProfile.jsx";

import ErrorBoundary from "./Components/ErrorBoundary.jsx";
import Chatbot from "./Components/Chatbot.jsx";
import BookingPage from "./pages/BookingPage";

// Component to protect public routes from authenticated users
function PublicRoute({ children }) {
  const { isAuthenticated, getRoleRedirect, user } = useAuth();

  if (isAuthenticated) {
    // Redirect authenticated users to their dashboard
    const correctPath = getRoleRedirect(user?.role);
    return <Navigate to={correctPath} replace />;
  }

  return children;
}

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
          <Route path="/Appointment-overview"element={<AppointmentOverview />}/>
          <Route path="/barber-dashboard" element={<BarberDashboard />} />
          <Route path="/barber-OwnProfile" element={<BarberOwnProfile />} />
          <Route path="/postingPhotos" element={<PostingPhotos />}/>
          <Route path="/share-post"    element={<SharePost />} />
          <Route path="/barber-vacancies"    element={<BarberVacanciesPage />} />
          <Route path="/barber-applications" element={<BarberApplicationsPage />} />
          <Route path="/customer-home" element={<CustomerHome />} />
          <Route path="/customer-search" element={<CustomerSearch />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/add-review" element={<AddReviewPage />} />
          <Route path="/barber-profile-view" element={<BarberProfileView />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/favourites" element={<Favourites />} />

          <Route path="/salon-home" element={<SalonHomePage />} />
          <Route path="/salon-hire" element={<SalonHirePage />} />
          <Route path="/salon-profile" element={<SalonProfilePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </FavouritesProvider>
      <AuthProvider>
        <ErrorBoundary>
          <FavouritesProvider>
            <Routes>
              {/* Public Routes - Protected from authenticated users */}
              <Route path="/" element={<Index />} />
              <Route
                path="/signin"
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                }
              />

              {/* Signup Routes - Allow access for both logged in and logged out users */}
              <Route path="/signup-barber" element={<SignUpBarber />} />
              <Route path="/signup-customer" element={<SignUpCustomer />} />
              <Route
                path="/signup-customer-final"
                element={<SignUpCustomerFinal />}
              />
              <Route path="/signup-salon" element={<SignUpSalon />} />

              {/* Verification Routes */}
              <Route
                path="/verification-step1"
                element={<VerificationStep1 />}
              />
              <Route
                path="/verification-step2"
                element={<VerificationStep2 />}
              />
              <Route path="/create-password" element={<CreatePassword />} />

              {/* Barber Signup Steps */}
              <Route
                path="/signup-barber-step4"
                element={<SignUpBarberStep4 />}
              />
              <Route
                path="/signup-barber-step5"
                element={<SignUpBarberStep5 />}
              />
              <Route
                path="/signup-barber-step6"
                element={<SignUpBarberStep6 />}
              />
              <Route
                path="/signup-barber-step7"
                element={<SignUpBarberStep7 />}
              />
              <Route
                path="/signup-barber-step8"
                element={<SignUpBarberStep8 />}
              />

              {/* Protected Routes - Role Based */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <CustomerHome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/barber-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <BarberDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/salon-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["salon"]}>
                    <SalonDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer-profile"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Profile - authenticated clients */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/favourites"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <Favourites />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/Appointment-overview"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <AppointmentOverview />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/barber-home"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <BarberHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barber-OwnProfile"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <BarberOwnProfile />
                  </ProtectedRoute>
                }
              />

              {/* Public Routes */}
              <Route path="/customer-search" element={<CustomerSearch />} />
              <Route
                path="/postingPhotos"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <PostingPhotos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/share-post"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <SharePost />
                  </ProtectedRoute>
                }
              />
              <Route path="/add-review" element={<AddReviewPage />} />
              <Route
                path="/barber-profile-view"
                element={<BarberProfileView />}
              />
              <Route
                path="/barber-profile-view/:barberId"
                element={<BarberProfileView />}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Chatbot />
          </FavouritesProvider>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
