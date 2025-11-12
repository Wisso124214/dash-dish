import "./App.css";
import DetailsOrder from "./components/DetailsOrder/DetailsOrder";
import Header from "./components/Header/Header";
import {
  SelectedDishProvider,
  useSelectedDish,
} from "./components/DishList/SelectedDishContext";
import Dishes from "./pages/Dishes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import { Route, Routes, Navigate } from "react-router";
import { useAtomValue } from "jotai/react";
import { userAtom } from "./lib/atoms";

function AppContent() {
  const { selectedDish } = useSelectedDish();
  const user = useAtomValue(userAtom);
  

  return (
    <>
      <div className="mt-[6vh] max-h-[90vh] flex flex-col p-0 m-0 overflow-y-auto self-center w-full items-center h-full">
        {selectedDish && <DetailsOrder {...selectedDish} />}
        <Header />
          <Routes>
            <Route
              path="/dishes"
              element={
                user?.isLoggedIn ? <Dishes /> : <Navigate to="/login" replace />
              }
            />

            <Route path="/signup" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Allow both / and /login to show the login page */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </div>
      <Toaster position="top-center" closeButton theme="dark" richColors />
    </>
  );
}

function App() {
  return (
    <SelectedDishProvider>
        <AppContent />
    </SelectedDishProvider>
  );
}

export default App;
