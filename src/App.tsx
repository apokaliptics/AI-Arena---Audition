import React, { useEffect } from 'react';
import { AppLayout } from './ui/layout';
import { ErrorBoundary } from './core/errorBoundary';
import { autoSaveEngine } from './core/cache';

export default function App() {
  // Tự động khôi phục phiên trước khi khởi chạy
  useEffect(() => {
    autoSaveEngine.restoreLastSession();
  }, []);

  return (
    <ErrorBoundary fallbackTitle="Không thể khởi tạo phòng vẽ di sản Sắc Việt">
      <AppLayout />
    </ErrorBoundary>
  );
}
