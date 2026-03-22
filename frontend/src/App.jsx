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
import SelectRole from "./pages/SelectRole.jsx";
import PostingPhotos from "./pages/PostingPhots.jsx";
import SharePost from "./pages/SharePost.jsx";
import BarberVacanciesPage from "./pages/BarberVacanciesPage.jsx";
import BarberApplicationsPage from "./pages/BarberApplicationsPage.jsx";
import SalonHomePage from "./pages/SalonHomePage.jsx";
import SalonHirePage from "./pages/SalonHirePage.jsx";
import SalonProfilePage from "./pages/SalonProfilePage.jsx";
import BarberOwnProfile from "./pages/BarberOwnProfile.jsx";
import AiRecommendation from "./pages/AiRecommendation.jsx";
import Messages from "./pages/Messages.jsx";

import ErrorBoundary from "./Components/ErrorBoundary.jsx";
import Chatbot from "./Components/Chatbot.jsx";
import BookingPage from "./pages/BookingPage";

// Component to protect public routes from authenticated users
function PublicRoute({ children }) {
  const { isAuthenticated, getRoleRedirect, user, needsRoleSelection } = useAuth();

  // OAuth user who hasn't picked a role yet → send to role selection
  if (needsRoleSelection) {
    return <Navigate to="/select-role" replace />;
  }

  if (isAuthenticated) {
    const correctPath = getRoleRedirect(user?.role);
    return <Navigate to={correctPath} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
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
              <Route path="/select-role" element={<SelectRole />} />

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

              {/* AI Hairstyle Recommendation */}
              <Route
                path="/ai-recommendation"
                element={
                  <ProtectedRoute allowedRoles={["client", "barber"]}>
                    <AiRecommendation />
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

              {/* Secure messaging route */}
              <Route
                path="/message"
                element={
                  <ProtectedRoute allowedRoles={["client", "barber", "salon"]}>
                    <Messages />
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
                path="/booking/:barberId"
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

              {/* Barber vacancy/application routes */}
              <Route
                path="/barber-vacancies"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <BarberVacanciesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barber-applications"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <BarberApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Salon routes */}
              <Route
                path="/salon-home"
                element={
                  <ProtectedRoute allowedRoles={["salon"]}>
                    <SalonHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salon-hire"
                element={
                  <ProtectedRoute allowedRoles={["salon"]}>
                    <SalonHirePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salon-profile"
                element={
                  <ProtectedRoute allowedRoles={["salon"]}>
                    <SalonProfilePage />
                  </ProtectedRoute>
                }
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
