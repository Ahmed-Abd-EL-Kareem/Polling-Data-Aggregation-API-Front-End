import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './app/store';
import { RootLayout } from './layouts/RootLayout';

const Home = lazy(() =>
  import('./features/polls/Home').then((m) => ({ default: m.Home }))
);
const Login = lazy(() =>
  import('./features/auth/Login').then((m) => ({ default: m.Login }))
);
const Register = lazy(() =>
  import('./features/auth/Register').then((m) => ({ default: m.Register }))
);
const CreatePoll = lazy(() =>
  import('./features/polls/CreatePoll').then((m) => ({ default: m.CreatePoll }))
);
const PollDetails = lazy(() =>
  import('./features/polls/PollDetails').then((m) => ({ default: m.PollDetails }))
);
const Profile = lazy(() =>
  import('./features/profile/Profile').then((m) => ({ default: m.Profile }))
);
const AdminDashboard = lazy(() =>
  import('./features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 pt-24 text-on-surface-variant">
      Loading…
    </div>
  );
}

function AuthRedirectHandler() {
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userString = params.get('user');

    if (!token || !userString) return;

    try {
      const user = JSON.parse(userString);
      setAuth(user, token);
      window.history.replaceState({}, document.title, location.pathname);
    } catch (error) {
      console.error('Failed to parse OAuth redirect payload', error);
    }
  }, [location.search, location.pathname, setAuth]);

  return null;
}

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthRedirectHandler />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/poll/:id" element={<PollDetails />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePoll />
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
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
