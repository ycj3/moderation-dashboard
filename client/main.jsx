import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuditLogPage from '/imports/ui/pages/AuditLogPage';
import ModerationPage from '/imports/ui/pages/ModerationPage';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);

  root.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModerationPage />} />
        <Route path="/logs" element={<AuditLogPage />} />
      </Routes>
    </BrowserRouter>
  );
});