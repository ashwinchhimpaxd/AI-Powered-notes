import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Standard Components (Lightweight)
import Login from "./Pages/LoginPage";
import LandingPage from "./Pages/LandingPage";
import Notfoundpage from "./Pages/Notfoundpage";
import ToastContainer from "./Component/Toast/ToastContainer";
import Appsetting from "./Component/Appsettings/Appsetting";
import RecentNotes from "./Component/DashBoardComps/Recentnotes";
// Lazy Loaded Components (Heavy chunks)
const Dashboard2 = lazy(() => import("./Pages/Dashboard.jsx"));
const Editorpage = lazy(() => import("./Pages/Editorpage.jsx"));
const EditProfile = lazy(() => import("./Component/Appsettings/allappsettingfeatures/EditProfile.jsx"));


const ProtectedRoute = ({ children, authentication = true }) => {

  const authStatus = useSelector(
    (state) => state.UserAuthantication.Islogin
  );

  // redux-persist load hone tak kuch render mat karo
  if (authStatus === undefined) {
    return null;
  }

  // Agar page private hai aur login nahi hai
  if (authentication && !authStatus) {
    return <Navigate to="/Login" />;
  }

  return children;
};

import userAuthService from "./AppWrite/auth.js";
import { login, logout } from "./redux/Authantication/UserAuthanticationSlice.js";
import { clearNotes } from "./redux/NotesCreation/NotesCreationSlice.js";

function App() {
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isLogin = useSelector((state) => state.UserAuthantication.Islogin);

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isLogin) {
          console.log("user already Login ")
          return;
        }
        console.log("user fetched from the server")
        const currentUser = await userAuthService.getCurrentUser();
        if (currentUser) {
          console.log("Login success")
          dispatch(login({
            UserData: {
              userdetaild: currentUser
            }
          }));
        } else {
          console.log("No user found")
          dispatch(clearNotes());
          dispatch(logout());
        }
      } catch (error) {
        console.error("Session check failed:", error);
        dispatch(clearNotes());
        dispatch(logout());
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [dispatch]);

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="h-screen w-full">
      <SpeedInsights />
      <ToastContainer />
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />

          {/* AUTH */}
          <Route
            path="/Login"
            element={
              <ProtectedRoute authentication={false}>
                <Login />
              </ProtectedRoute>
            }
          />



          {/* PRIVATE */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute authentication={true}>
                <Suspense fallback={null}>
                  {/* <p>ashwin only </p> */}
                  <Dashboard2 />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="recent-notes" replace />} />
            <Route path="setting" element={<Appsetting />} />
            <Route path="recent-notes" element={<RecentNotes />} />
          </Route>

          <Route
            path="/Dashboard/editor"
            element={
              <ProtectedRoute authentication={true}>
                <Suspense fallback={null}>
                  <Editorpage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/Dashboard/editor/:slug"
            element={
              <ProtectedRoute authentication={true}>
                <Suspense fallback={null}>
                  <Editorpage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute authentication={true}>
                <Suspense fallback={null}>
                  <EditProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* 
          <Route
            path="/setting"
            element={
              <ProtectedRoute authentication={true}>
                <Suspense fallback={null}>
                  <Appsetting />
                </Suspense>
              </ProtectedRoute>
            }
          /> */}

          {/* 404 */}
          <Route path="*" element={<Notfoundpage />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;