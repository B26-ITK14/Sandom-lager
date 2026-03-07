/*
    * types.ts
    * Shared types for the notification system.
    * Author: Emil Berglund
*/

import type { RouteNickname } from '../../router/routes';

export interface Notification {
    id: number;
    type: 'warning' | 'info' | 'alert';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    locationNickname?: RouteNickname; // Route nickname for related page
}
