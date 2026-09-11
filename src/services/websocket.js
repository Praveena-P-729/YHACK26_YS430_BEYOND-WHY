/**
 * Real-Time WebSocket Client for Landslide Alert Stream
 */

class AlertWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.reconnectDelay = 2000;
    this.pingInterval = null;
    this.isConnected = false;
  }

  getWebSocketUrl() {
    // Check if custom backend URL is configured via environment
    const envApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (envApi) {
      const cleanUrl = envApi.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const wsProto = cleanUrl.startsWith('https') ? 'wss:' : 'ws:';
      const host = cleanUrl.replace(/^https?:\/\//, '');
      return `${wsProto}//${host}/ws/alerts`;
    }

    // Default to current host or localhost:8000
    const isHttps = window.location.protocol === 'https:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '127.0.0.1:8000' 
      : window.location.host;
    
    const wsProto = isHttps ? 'wss:' : 'ws:';
    return `${wsProto}//${host}/ws/alerts`;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    console.log(`[WebSocket] Connecting to real-time alert stream: ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Real-time landslide alert stream CONNECTED.');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Start ping heartbeat
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('ping');
          }
        }, 25000);
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'REALTIME_LANDSLIDE_ALERT') {
            console.log('[WebSocket] Alert Received:', payload.data);
            this.notifyListeners(payload.data);
          }
        } catch (err) {
          // Ignore plain ping/pong responses
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Alert stream connection notice:', error);
        this.socket.close();
      };
    } catch (e) {
      console.warn('[WebSocket] Init error:', e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1));
      setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    if (!this.isConnected) {
      this.connect();
    }
    return () => this.listeners.delete(callback);
  }

  notifyListeners(alertData) {
    this.listeners.forEach((callback) => {
      try {
        callback(alertData);
      } catch (err) {
        console.error('[WebSocket] Listener callback error:', err);
      }
    });
  }

  disconnect() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const alertWebSocketService = new AlertWebSocketService();
