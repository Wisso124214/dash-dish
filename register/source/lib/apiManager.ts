import type * as apiTypes from './types/api.js';
import {Dish, Order, OrderItem} from './types/index.js';
import {getDefaultStore} from 'jotai';
import {sessionAtom} from './atoms.js';
import WebSocket from 'ws';
import 'dotenv/config';

const apiUrl = process.env['API_URL'] || 'http://localhost:8000';
const store = getDefaultStore();

export async function login(
	email: string,
	password: string,
): Promise<apiTypes.LoginResponse> {
	console.log(`Logging in to ${apiUrl} with email: ${email}`);
	const response = await fetch(`${apiUrl}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({email, password}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.detail || 'Login failed');
	}

	return response.json() as Promise<apiTypes.LoginResponse>;
}

export async function fetchMenu(): Promise<Dish[]> {
	const response = await fetch(`${apiUrl}/dishes`, {
		method: 'GET',
		headers: {
			'session-id': store.get(sessionAtom)?.sessionId || '',
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.detail || 'Failed to fetch menu');
	}

	return response.json() as Promise<Dish[]>;
}

export async function submitOrder(orderItems: OrderItem[]): Promise<Order> {
	const response = await fetch(`${apiUrl}/orders`, {
		method: 'POST',
		headers: {
			'session-id': store.get(sessionAtom)?.sessionId || '',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(orderItems),
	});
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.detail || 'Failed to submit order');
	}
	return response.json() as Promise<Order>;
}

export function subscribeToOrderUpdates(
	onUpdate: (order: Order) => void,
	onError?: (error: Error) => void,
): WebSocket {
	const sessionId = store.get(sessionAtom)?.sessionId || '';
	const wsUrl = `${apiUrl.replace(
		/^http/,
		'ws',
	)}/ws/orders?session-id=${encodeURIComponent(sessionId)}`;

	console.log(`Connecting to WebSocket at ${wsUrl}`);

	const ws = new WebSocket(wsUrl);

	ws.on('open', () => {
		console.log('WebSocket connected');
	});

	ws.on('message', data => {
		try {
			const order = JSON.parse(data.toString());
			onUpdate(order);
		} catch (error) {
			console.error('Failed to parse order:', error);
			if (onError) {
				onError(
					error instanceof Error ? error : new Error('Failed to parse order'),
				);
			}
		}
	});

	ws.on('error', error => {
		console.error('WebSocket error:', error);
		if (onError) {
			onError(error instanceof Error ? error : new Error('WebSocket error'));
		}
	});

	ws.on('close', () => {
		console.log('WebSocket disconnected');
	});

	return ws;
}
