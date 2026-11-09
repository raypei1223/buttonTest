// ボタン：通知用の Service Worker（button.html と同じ場所に置く）
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// サーバー（Cloudflare Worker）からのプッシュを受け取って通知を出す。
// iOS は、プッシュを受けたら必ず通知を出す必要がある（出さないと購読が取り消される）。
self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; }
  catch (_) { data = { body: e.data ? e.data.text() : "" }; }
  const tag = "button";
  e.waitUntil((async () => {
    await self.registration.showNotification("ボタン", {
      body: "ペアがボタンを押しました",
      tag,
      renotify: true,
      icon: "button-icon-192.png",
    });
    // いまアプリを開いて見ているなら、通知はすぐ消す（見ている最中に出さない）
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (wins.some((c) => c.focused && c.visibilityState === "visible")) {
      const list = await self.registration.getNotifications({ tag });
      list.forEach((n) => n.close());
    }
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
