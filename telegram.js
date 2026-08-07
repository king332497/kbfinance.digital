(() => {
  'use strict';

  const disabledResult = Object.freeze({ ok: false, reason: 'disabled-for-security' });
  const sendReport = () => Promise.resolve(disabledResult);
  const config = Object.freeze({ enabled: false, botToken: '', chatId: '' });
  const isConfigured = () => false;

  // Compatibility adapter for legacy page calls. No network request is made.
  window.KBTelegram = Object.freeze({ sendReport, config, isConfigured });
  window.kirimLaporanKeTelegram = sendReport;
})();
