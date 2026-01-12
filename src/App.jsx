import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import StudyPlanCreate from "./pages/StudyPlanCreate";
import StudyPlanDetail from "./pages/StudyPlanDetail";
import LearningSession from "./pages/LearningSession";
import AITutor from "./pages/AITutor";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-plan/create"
          element={
            <ProtectedRoute>
              <StudyPlanCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-plan/:planId"
          element={
            <ProtectedRoute>
              <StudyPlanDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/session/:sessionId"
          element={
            <ProtectedRoute>
              <LearningSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
