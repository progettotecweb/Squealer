self.addEventListener('push', async (event) => {
    if (event.data) {
      const eventData = await event.data.json()
      showLocalNotification(eventData.title, eventData.body, self.registration)
    }
  })
  
  const showLocalNotification = (title, body, swRegistration) => {
    swRegistration.showNotification(title, {
      body,
      icon: '/ios/256.png',
    })
  }

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('https://site222303.tw.cs.unibo.it/Home/')
    );
  })