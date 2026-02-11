import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async start(token) {
        if (this.connection) {
            return;
        }

        this.connection = new HubConnectionBuilder()
            .withUrl('https://localhost:7024/chathub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        try {
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR Connected');
        } catch (err) {
            console.error('SignalR Connection Error:', err);
            this.isConnected = false;
        }
    }

    async stop() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            this.isConnected = false;
        }
    }

    // Send message via SignalR
    async sendMessage(receiverId, message) {
        if (this.connection && this.isConnected) {
            await this.connection.invoke('SendMessage', receiverId, message);
        }
    }

    // Listen for new messages
    onReceiveMessage(callback) {
        if (this.connection) {
            this.connection.on('ReceiveMessage', callback);
        }
    }

    // Listen for conversation status changes
    onConversationStatusChanged(callback) {
        if (this.connection) {
            this.connection.on('ConversationStatusChanged', callback);
        }
    }

    // Listen for message read status
    onMessageRead(callback) {
        if (this.connection) {
            this.connection.on('MessageRead', callback);
        }
    }

    // Remove all listeners
    off(eventName) {
        if (this.connection) {
            this.connection.off(eventName);
        }
    }
}

export default new SignalRService();
