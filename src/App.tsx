import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import PuyuhPage from '@/pages/Puyuh/PuyuhPage';
import FinancePage from '@/pages/Finance/FinancePage';
import IncomePage from '@/pages/Finance/IncomePage';
import ExpensePage from '@/pages/Finance/ExpensePage';
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
          <Route path="finance/income" element={<IncomePage />} />
          <Route path="finance/expense" element={<ExpensePage />} />
          <Route path="production" element={<ProductionPage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
