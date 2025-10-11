// Service Worker for offline caching and background sync
const CACHE_NAME = 'mmhrm-dashboard-v1';
const API_CACHE_NAME = 'mmhrm-api-v1';
const STATIC_CACHE_NAME = 'mmhrm-static-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for API calls
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for dashboard data
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// URLs to cache immediately
const STATIC_URLS = [
  '/',
  '/admin',
  '/employee',
  '/hr',
  '/manifest.json',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/dashboard/sections',
  '/api/employees',
  '/api/leave-requests',
  '/api/teams',
  '/api/time-entries',
  '/api/leave-balances',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_URLS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith('/_next/static/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle page requests
  if (url.pathname.startsWith('/') && !url.pathname.startsWith('/api/')) {
    event.respondWith(handlePageRequest(request));
    return;
  }
});

// API request handler - Network first with cache fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline indicator
      const response = cachedResponse.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    
    // Return offline page for API requests
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Static asset handler - Cache first
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Page request handler - Stale while revalidate
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return networkPromise || new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get pending actions from IndexedDB
  const pendingActions = await getPendingActions();
  
  for (const action of pendingActions) {
    try {
      await syncAction(action);
      await removePendingAction(action.id);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Store pending actions in IndexedDB
async function storePendingAction(action) {
  const db = await openDB();
  const transaction = db.transaction(['pendingActions'], 'readwrite');
  const store = transaction.objectStore('pendingActions');
  await store.add(action);
}

// Get pending actions from IndexedDB
async function getPendingActions() {
  const db = await openDB();
  const transaction = db.transaction(['pendingActions'], 'readonly');
  const store = transaction.objectStore('pendingActions');
  return await store.getAll();
}

// Remove pending action from IndexedDB
async function removePendingAction(id) {
  const db = await openDB();
  const transaction = db.transaction(['pendingActions'], 'readwrite');
  const store = transaction.objectStore('pendingActions');
  await store.delete(id);
}

// Sync individual action
async function syncAction(action) {
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body,
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MMHRMOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingActions')) {
        const store = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('pendingNotifications')) {
        const store = db.createObjectStore('pendingNotifications', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('tag', 'tag', { unique: false });
      }
    };
  });
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'MMHRM Notification',
    body: 'You have a new notification',
    icon: '/placeholder-logo.png',
    badge: '/placeholder-logo.png',
    tag: 'mmhrm-notification',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'MMHRM Notification',
        body: data.body || 'You have a new notification',
        icon: data.icon || '/placeholder-logo.png',
        badge: data.badge || '/placeholder-logo.png',
        tag: data.tag || 'mmhrm-notification',
        data: {
          url: data.url || '/',
          type: data.type || 'general',
          payload: data.payload || {},
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      // Use default notification data
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    requireInteraction: notificationData.data.type === 'leave_request' || 
                       notificationData.data.type === 'leave_approved' || 
                       notificationData.data.type === 'leave_rejected',
    data: notificationData.data,
    actions: getNotificationActions(notificationData.data.type)
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Get notification actions based on type
function getNotificationActions(type) {
  const baseActions = [
    {
      action: 'close',
      title: 'Close',
      icon: '/placeholder-logo.png',
    }
  ];

  switch (type) {
    case 'leave_request':
      return [
        {
          action: 'view_request',
          title: 'View Request',
          icon: '/placeholder-logo.png',
        },
        ...baseActions
      ];
    case 'leave_approved':
    case 'leave_rejected':
      return [
        {
          action: 'view_leave',
          title: 'View Leave',
          icon: '/placeholder-logo.png',
        },
        ...baseActions
      ];
    case 'payroll':
      return [
        {
          action: 'view_payroll',
          title: 'View Payroll',
          icon: '/placeholder-logo.png',
        },
        ...baseActions
      ];
    default:
      return [
        {
          action: 'view_dashboard',
          title: 'View Dashboard',
          icon: '/placeholder-logo.png',
        },
        ...baseActions
      ];
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const action = event.action;
  
  let targetUrl = notificationData.url || '/';
  
  // Handle different actions
  switch (action) {
    case 'view_request':
      targetUrl = '/admin/leave-requests';
      break;
    case 'view_leave':
      targetUrl = '/employee';
      break;
    case 'view_payroll':
      targetUrl = '/employee/finances';
      break;
    case 'view_dashboard':
      targetUrl = '/';
      break;
    case 'close':
      return; // Just close, don't open anything
    default:
      // Default action or notification body click
      targetUrl = notificationData.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Get pending notifications from IndexedDB
    const pendingNotifications = await getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          tag: notification.tag,
          data: notification.data,
          requireInteraction: notification.requireInteraction,
          actions: notification.actions
        });
        
        // Remove from pending after successful display
        await removePendingNotification(notification.id);
      } catch (error) {
        console.error('Failed to show pending notification:', error);
      }
    }
  } catch (error) {
    console.error('Background sync for notifications failed:', error);
  }
}

// Store pending notification in IndexedDB
async function storePendingNotification(notification) {
  const db = await openDB();
  const transaction = db.transaction(['pendingNotifications'], 'readwrite');
  const store = transaction.objectStore('pendingNotifications');
  await store.add({
    ...notification,
    timestamp: Date.now()
  });
}

// Get pending notifications from IndexedDB
async function getPendingNotifications() {
  const db = await openDB();
  const transaction = db.transaction(['pendingNotifications'], 'readonly');
  const store = transaction.objectStore('pendingNotifications');
  return await store.getAll();
}

// Remove pending notification from IndexedDB
async function removePendingNotification(id) {
  const db = await openDB();
  const transaction = db.transaction(['pendingNotifications'], 'readwrite');
  const store = transaction.objectStore('pendingNotifications');
  await store.delete(id);
}
