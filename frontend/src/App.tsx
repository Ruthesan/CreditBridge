import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute, GuestRoute } from './components/layout/ProtectedRoute';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const LendersPage = lazy(() => import('./pages/LendersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Loader2 className="animate-spin text-primary" size={26} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />

                  <Route element={<GuestRoute />}>
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<DashboardLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="upload" element={<UploadPage />} />
                      <Route path="analysis" element={<AnalysisPage />} />
                      <Route path="recommendations" element={<RecommendationsPage />} />
                      <Route path="lenders" element={<LendersPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="history" element={<HistoryPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
