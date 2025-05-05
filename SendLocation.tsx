import React, { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Client } from '@stomp/stompjs';

const STOMP_URL = 'ws://192.168.0.122:8080/ws'; // direct WebSocket URL

const SendLocation = ({ orderId, riderId }: { orderId: string, riderId: string }) => {
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: STOMP_URL, // 🔥 No SockJS
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP DEBUG]', msg),
      onConnect: () => {
        console.log('✅ WebSocket connected');
        startSendingLocation();
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
      },
    });

    stompClient.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startSendingLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.warn('❌ Location permission not granted');
      return;
    }

    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const message = {
          orderId,
          riderId, // Include riderId if needed on backend
          latitude,
          longitude,
        };

        if (stompClient.current?.connected) {
          stompClient.current.publish({
            destination: '/app/location/update',
            body: JSON.stringify(message),
          });
          console.log('📍 Location sent:', message);
        } else {
          console.warn('❌ STOMP client not connected');
        }
      },
      (error) => {
        console.error('❌ Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  return null;
};

export default SendLocation;
