import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ui/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import VipPlans from './pages/vip/VipPlans';
import Deposit from './pages/deposit/Deposit';
import Withdraw from './pages/withdraw/Withdraw';
import Wallet from './pages/wallet/Wallet';
import GameCenter from './pages/game/GameCenter';
import RewardsHistory from './pages/rewards/RewardsHistory';
import TransactionHistory from './pages/rewards/TransactionHistory';
import Referral from './pages/referral/Referral';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';

import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminPlans from './pages/admin/AdminPlans';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vip-plans" element={<VipPlans />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/game" element={<GameCenter />} />
              <Route path="/rewards" element={<RewardsHistory />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/referral" element={<Referral />} />

              <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits /></AdminRoute>} />
              <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
              <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
