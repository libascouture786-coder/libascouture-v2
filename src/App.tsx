import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { Loader } from '@/components/layout/Loader';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Home } from '@/routes/Home';

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}

const About = lazy(() => import('@/routes/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('@/routes/Contact').then((m) => ({ default: m.Contact })));
const Collections = lazy(() => import('@/routes/Collections').then((m) => ({ default: m.Collections })));
const ProductDetail = lazy(() => import('@/routes/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Wishlist = lazy(() => import('@/routes/Wishlist').then((m) => ({ default: m.Wishlist })));
const NotFound = lazy(() => import('@/routes/NotFound').then((m) => ({ default: m.NotFound })));
const CreateYourOwn = lazy(() => import('@/routes/CreateYourOwn').then((m) => ({ default: m.CreateYourOwn })));
const Appointments = lazy(() => import('@/routes/Appointments').then((m) => ({ default: m.Appointments })));
const Measurements = lazy(() => import('@/routes/Measurements').then((m) => ({ default: m.Measurements })));

const AdminLogin = lazy(() => import('@/routes/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminForgotPassword = lazy(() => import('@/routes/admin/AdminForgotPassword').then((m) => ({ default: m.AdminForgotPassword })));
const AdminResetPassword = lazy(() => import('@/routes/admin/AdminResetPassword').then((m) => ({ default: m.AdminResetPassword })));
const AdminDashboard = lazy(() => import('@/routes/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('@/routes/admin/AdminProducts').then((m) => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import('@/routes/admin/AdminProductForm').then((m) => ({ default: m.AdminProductForm })));
const AdminMedia = lazy(() => import('@/routes/admin/AdminMedia').then((m) => ({ default: m.AdminMedia })));
const AdminHomepage = lazy(() => import('@/routes/admin/AdminHomepage').then((m) => ({ default: m.AdminHomepage })));
const AdminCustomRequests = lazy(() => import('@/routes/admin/AdminCustomRequests').then((m) => ({ default: m.AdminCustomRequests })));
const AdminAppointments = lazy(() => import('@/routes/admin/AdminAppointments').then((m) => ({ default: m.AdminAppointments })));
const AdminEnquiries = lazy(() => import('@/routes/admin/AdminEnquiries').then((m) => ({ default: m.AdminEnquiries })));
const AdminPages = lazy(() => import('@/routes/admin/AdminPages').then((m) => ({ default: m.AdminPages })));
const AdminSeo = lazy(() => import('@/routes/admin/AdminSeo').then((m) => ({ default: m.AdminSeo })));
const AdminAnalytics = lazy(() => import('@/routes/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics })));
const AdminSettings = lazy(() => import('@/routes/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AdminCategories = lazy(() => import('@/routes/admin/AdminCategories').then((m) => ({ default: m.AdminCategories })));

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WishlistProvider>
          <AppointmentProvider>
            <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader /></div>}>
              <Routes>
                {/* Public routes */}
                <Route element={<RootLayout />}>
                  <Route index element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collections/:slug" element={<Collections />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/create-your-own" element={<CreateYourOwn />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/measurements" element={<Measurements />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin routes — single shared AdminAuthProvider */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminLogin />} />
                  <Route path="forgot-password" element={<AdminForgotPassword />} />
                  <Route path="reset-password" element={<AdminResetPassword />} />
                  <Route element={<ProtectedRoute><Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ivory-50"><Loader /></div>}><Outlet /></Suspense></ProtectedRoute>}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id" element={<AdminProductForm />} />
                    <Route path="products/:id/edit" element={<AdminProductForm />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="homepage" element={<AdminHomepage />} />
                    <Route path="custom-requests" element={<AdminCustomRequests />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="enquiries" element={<AdminEnquiries />} />
                    <Route path="pages" element={<AdminPages />} />
                    <Route path="seo" element={<AdminSeo />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="collections" element={<AdminCategories />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </AppointmentProvider>
        </WishlistProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
