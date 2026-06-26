import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import PuyuhPage from '@/pages/Puyuh/PuyuhPage';
import FinancePage from '@/pages/Finance/FinancePage';
import TransactionHistoryPage from '@/pages/Finance/TransactionHistoryPage';
import SummaryPage from '@/pages/Summary/SummaryPage';
import ProductionPage from '@/pages/Production/ProductionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/puyuh" replace />} />
          <Route path="puyuh" element={<PuyuhPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="finance/income" element={<TransactionHistoryPage />} />
          <Route path="finance/expense" element={<TransactionHistoryPage />} />
          <Route path="production" element={<ProductionPage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
