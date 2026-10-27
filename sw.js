/* 客語分級隨機詞卡：每日一詞通知。伺服器只送一個「該通知了」的訊號，這裡再去拿今天的詞。 */
const API = 'https://chouinn-tools.chouinn-moie.workers.dev/push/api';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let w = null;
    try {
      const sub = await self.registration.pushManager.getSubscription();
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fn: 'today', args: [sub ? sub.endpoint : ''] }) });
      const j = await r.json(); w = j.result;
    } catch (err) {}
    const title = w ? '客語每日一詞：' + w.word : '客語每日一詞';
    const body = w ? [w.pinyin, w.def ? '華語：' + w.def : '', w.example ? '例句：' + w.example : ''].filter(Boolean).join('\n') : '點開來看今天的客語詞！';
    await self.registration.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'hakka-daily', data: { word: w ? w.word : '' } });
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const word = e.notification.data && e.notification.data.word;
  const url = new URL('./' + (word ? '?w=' + encodeURIComponent(word) : ''), self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if (c.url.startsWith(self.registration.scope) && 'focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  })());
});
