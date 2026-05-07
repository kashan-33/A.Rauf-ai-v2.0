var reminders = [];

self.addEventListener('install', function(e){ 
  self.skipWaiting(); 
});

self.addEventListener('activate', function(e){ 
  e.waitUntil(clients.claim()); 
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});

self.addEventListener('message', function(e){
  if(!e.data) return;
  
  if(e.data.type === 'SCHEDULE_REMINDER'){
    var task = e.data.task;
    var remind = task.remind.split(':');
    var now = new Date();
    var remindTime = new Date();
    remindTime.setHours(parseInt(remind[0]), parseInt(remind[1]), 0, 0);
    
    // If time passed today, set for tomorrow
    if(remindTime.getTime() <= now.getTime()){
      remindTime.setDate(remindTime.getDate() + 1);
    }
    
    var delay = remindTime.getTime() - now.getTime();
    
    // Store reminder
    reminders.push({task: task, time: remindTime.getTime()});
    
    // Schedule notification
    setTimeout(function(){
      self.registration.showNotification('⏰ EliteBot Reminder!', {
        body: task.t,
        icon: './logo_192.png',
        badge: './logo_192.png',
        vibrate: [500, 200, 500, 200, 500],
        requireInteraction: true,
        tag: 'reminder-' + task.id,
        actions: [
          {action: 'done', title: '✅ Done'},
          {action: 'snooze', title: '⏰ 5 min'}
        ]
      });
    }, delay);
    
    // Send confirmation back
    e.source.postMessage({type: 'REMINDER_SCHEDULED', taskId: task.id, delay: delay});
  }
  
  if(e.data.type === 'CANCEL_REMINDER'){
    // Cancel by closing notification with tag
    self.registration.getNotifications({tag: 'reminder-' + e.data.taskId}).then(function(notifications){
      notifications.forEach(function(n){ n.close(); });
    });
  }
});
