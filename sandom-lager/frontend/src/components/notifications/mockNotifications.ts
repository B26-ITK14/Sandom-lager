/*
    * mockNotifications.ts
    * Mock notification data for development and testing.
    * Replace with real data from backend when available.
    * Author: Emil Berglund
*/

import { ROUTES } from '../../router/routes';
import type { Notification } from './types';

export const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'warning',
        title: 'Lav lagerbeholdning',
        message: 'Melk har kun 1 enhet igjen på lager',
        time: '2 timer siden',
        isRead: false,
        locationNickname: ROUTES.STORAGE.nickname,
    },
    {
        id: 2,
        type: 'alert',
        title: 'Produkt utgår snart',
        message: 'Yoghurt utgår om 2 dager',
        time: '5 timer siden',
        isRead: false,
        locationNickname: ROUTES.STORAGE.nickname,
    },
    {
        id: 3,
        type: 'info',
        title: 'Handleliste oppdatert',
        message: 'Emil la til 3 nye varer i handlelisten',
        time: '1 dag siden',
        isRead: true,
        locationNickname: ROUTES.SHOPPING_LIST.nickname,
    },
];
