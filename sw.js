self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(clients.claim()); });

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});

self.addEventListener('message', function(e){
  if(!e.data || e.data.type !== 'SCHEDULE_REMINDER') return;
  var task = e.data.task;
  var remind = task.remind.split(':');
  var now = new Date();
  var remindTime = new Date();
  remindTime.setHours(parseInt(remind[0]), parseInt(remind[1]), 0, 0);
  if(remindTime <= now) remindTime.setDate(remindTime.getDate() + 1);
  var delay = remindTime.getTime() - now.getTime();
  setTimeout(function(){
    self.registration.showNotification('⏰ EliteBot Reminder', {
      body: task.t,
      icon: './logo_192.png',
      badge: './logo_192.png',
      vibrate: [400, 200, 400, 200, 400],
      requireInteraction: true,
      tag: 'reminder-'+task.id
    });
  }, delay);
});
