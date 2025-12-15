import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { Dashboard } from './pages/Dashboard';
import { CaseCards } from './pages/CaseCards';
import { AuthSuite } from './pages/AuthSuite';
import { LettersStudio } from './pages/LettersStudio';
import { ClinicalOutputStudio } from './pages/ClinicalOutputStudio';
import { Evidence } from './pages/Evidence';
import { Templates } from './pages/Templates';
import { AuditLog } from './pages/AuditLog';
import { Settings } from './pages/Settings';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="cases" element={<CaseCards />} />
          <Route path="auth" element={<AuthSuite />} />
          <Route path="letters" element={<LettersStudio />} />
          <Route path="clinical" element={<ClinicalOutputStudio />} />
          <Route path="evidence" element={<Evidence />} />
          <Route path="templates" element={<Templates />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;