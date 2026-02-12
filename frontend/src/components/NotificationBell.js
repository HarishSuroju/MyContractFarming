import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationAPI } from '../services/api';
import io from 'socket.io-client';

const NotificationBell = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
        auth: {
          token
        }
      });

      socketRef.current.on('connect', () => {
        console.log('[NotificationBell] Connected to notification server');
        // Join user room
        if (userId) {
          console.log('[NotificationBell] Joining room:', userId);
          socketRef.current.emit('join', userId);
        }
      });

      // Listen for new notifications
      socketRef.current.on('notification:new', (notification) => {
        console.log('[NotificationBell] Real-time notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socketRef.current.on('disconnect', () => {
        console.log('[NotificationBell] Disconnected from notification server');
      });
      
      // Fetch initial notifications only if token is available
      fetchNotifications();
      fetchUnreadCount();
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        // Only disconnect if socket is connected or connecting
        if (socketRef.current.connected || socketRef.current.connecting) {
          socketRef.current.disconnect();
        } else {
          // Force close if still trying to connect
          socketRef.current.close();
        }
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('[NotificationBell] Fetching notifications...');
      const response = await notificationAPI.getUserNotifications({ limit: 5 });
      console.log('[NotificationBell] API response:', response.data);
      console.log('[NotificationBell] Notifications received:', response.data.data.notifications.length);
      if (response.data.data.notifications.length > 0) {
        console.log('[NotificationBell] Notification types:', response.data.data.notifications.map(n => n.type));
      }
      setNotifications(response.data.data.notifications);
    } catch (error) {
      // Only log non-403 errors
      if (error.response?.status !== 403) {
        console.error('[NotificationBell] Failed to fetch notifications:', error);
      }
      // Silently fail for 403 - user profile may not be complete yet
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      console.log('[NotificationBell] Unread count:', response.data.data.unreadCount);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      // Only log non-403 errors
      if (error.response?.status !== 403) {
        console.error('[NotificationBell] Failed to fetch unread count:', error);
      }
      // Silently fail for 403 - user profile may not be complete yet
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read if not already read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate to relevant page based on notification type
    switch (notification.referenceType) {
      case 'connection_request':
      case 'interest_received':
        // Navigate to requests page with tab and highlight parameters
        window.location.href = `/dashboard/requests?tab=incoming&highlight=${notification.referenceId || notification._id}`;
        break;
      case 'connection':
        // Handle both string IDs and object structures for senderId
        let senderId = null;
        
        if (typeof notification.senderId === 'string') {
          // senderId is a string
          senderId = notification.senderId;
        } else if (notification.senderId && typeof notification.senderId === 'object' && notification.senderId._id) {
          // senderId is an object with _id property
          senderId = notification.senderId._id;
        } else if (notification.senderId && typeof notification.senderId === 'object' && notification.senderId.id) {
          // senderId is an object with id property
          senderId = notification.senderId.id;
        }
        
        // Validate senderId before navigating
        if (senderId && senderId.length >= 12) {
          // Check if user is navigating to their own profile
          const currentUserId = localStorage.getItem('userId');
          if (senderId === currentUserId) {
            // If it's their own notification, redirect to connection requests
            window.location.href = '/connection-requests';
          } else {
            window.location.href = `/user-profile/${senderId}`;
          }
        } else {
          console.error('Invalid sender ID in notification:', notification.senderId);
          // Just close the dropdown if ID is invalid
        }
        break;
      case 'agreement':
        window.location.href = `/agreement-manager/${notification.referenceId}`;
        break;
      case 'proposal':
        window.location.href = `/proposals`;
        break;
      default:
        // Handle other notification types
        break;
    }
    
    setIsOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return t('notifications.time.justNow');
    } else if (diffInHours < 24) {
      return `${diffInHours}${t('notifications.time.hoursAgo')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label={t('notifications.bellIcon')}
      >
        <svg
          className="w-6 h-6 text-gray-900"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('No Notifications')}
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between">
                        <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                window.location.href = '/dashboard/requests';
                setIsOpen(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('View All Notifications')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;