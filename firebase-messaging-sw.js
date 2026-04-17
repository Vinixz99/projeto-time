// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCu4_fFpODAZYGzf8cH6FYzoAczO08obUg",
  authDomain: "time-efd5d.firebaseapp.com",
  projectId: "time-efd5d",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
});

const messaging = firebase.messaging();

// Receber notificações em background
messaging.onBackgroundMessage((payload) => {
  console.log('Notificação em background:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/logo-nexus.png',
    badge: '/img/logo-nexus.png',
    data: {
      url: payload.data?.url || '/'
    }
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lidar com clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});