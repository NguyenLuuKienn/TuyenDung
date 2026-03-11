import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';

export const useNotification = () => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7157/notificationhub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to NotificationHub');
                    connection.on('ReceiveNotification', (notification) => {
                        console.log('Notification received:', notification);
                        toast.info(notification.title || 'New Notification', {
                            description: notification.message,
                            action: {
                                label: 'View',
                                onClick: () => {
                                    if (notification.link) {
                                        window.location.href = notification.link;
                                    }
                                }
                            }
                        });
                        // Optional: trigger a refetch of notification count in your store/context
                    });
                })
                .catch(error => console.error('NotificationHub Connection Error: ', error));

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    return { connection };
};
