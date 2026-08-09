import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { FollowupsPage } from '../pages/customers/FollowupsPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';
import { StockMovementsPage } from '../pages/products/StockMovementsPage';
import { ChallansPage } from '../pages/challans/ChallansPage';
import { CreateChallanPage } from '../pages/challans/CreateChallanPage';
import { ChallanDetailPage } from '../pages/challans/ChallanDetailPage';
import { UsersPage } from '../pages/users/UsersPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected Dashboard Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* CRM */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route
          path="followups"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales', 'Accounts']}>
              <FollowupsPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="stock-movements" element={<StockMovementsPage />} />

        {/* Sales Challans */}
        <Route path="challans" element={<ChallansPage />} />
        <Route
          path="challans/new"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
              <CreateChallanPage />
            </ProtectedRoute>
          }
        />
        <Route path="challans/:id" element={<ChallanDetailPage />} />

        {/* Administration */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
