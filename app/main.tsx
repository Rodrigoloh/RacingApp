import React from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SessionHUD from './session-hud';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

createRoot(container).render(
  <React.StrictMode>
    <SafeAreaProvider>
      <SessionHUD />
    </SafeAreaProvider>
  </React.StrictMode>
);

