import "./global.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUpBarber from "./pages/SignUpBarber.jsx";
import SignUpCustomer from "./pages/SignUpCustomer.jsx";
import VerificationStep1 from "./pages/VerificationStep1.jsx";
import VerificationStep2 from "./pages/VerificationStep2.jsx";


export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />


          <Route path="/signup-barber" element={<SignUpBarber />} />


          <Route path="/signup-customer" element={<SignUpCustomer />} />
          <Route path="/verification-step1" element={<VerificationStep1 />} />
          <Route path="/verification-step2" element={<VerificationStep2 />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  );
}
