import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {subscribeToOrderUpdates} from '../lib/apiManager.js';
import {OrderItem} from '../components/OrderItem.js';
import type {Order, Dish} from '../lib/types/index.js';
import {useStdoutDimensions} from '../lib/hooks/useStdoutDimensions.js';

export default function KitchenScreen() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [menu, setMenu] = useState<Dish[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollOffset, setScrollOffset] = useState(0);
	const [_, height] = useStdoutDimensions();
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'error'
	>('connecting');
	const [errorMessage, setErrorMessage] = useState<string>('');

	// Subscribe to order updates via WebSocket
	useEffect(() => {
		let ws: any = null;

		try {
			setConnectionStatus('connecting');
			ws = subscribeToOrderUpdates(
				(order: Order) => {
					setOrders(prevOrders => {
						// Check if order already exists, update it; otherwise add it
						const existingIndex = prevOrders.findIndex(
							o => o._id === order._id,
						);
						if (existingIndex !== -1) {
							const newOrders = [...prevOrders];
							newOrders[existingIndex] = order;
							return newOrders;
						} else {
							return [order, ...prevOrders]; // Add new orders at the top
						}
					});
				},
				(error: Error) => {
					setConnectionStatus('error');
					setErrorMessage(error.message);
				},
			);

			// Handle connection open event
			ws.on('open', () => {
				setConnectionStatus('connected');
				setErrorMessage('');
			});

			// Handle connection close event
			ws.on('close', () => {
				setConnectionStatus('error');
				setErrorMessage('WebSocket connection closed');
			});
		} catch (error) {
			setConnectionStatus('error');
			setErrorMessage(
				error instanceof Error ? error.message : 'Failed to connect',
			);
		}

		return () => {
			if (ws) {
				ws.close();
			}
		};
	}, []);

	// Fetch menu for dish details
	useEffect(() => {
		async function loadMenu() {
			try {
				const {fetchMenu} = await import('../lib/apiManager.js');
				const fetchedMenu = await fetchMenu();
				setMenu(fetchedMenu);
			} catch (error) {
				console.error('Failed to load menu:', error);
			}
		}
		loadMenu();
	}, []);

	// Handle keyboard navigation
	useInput((_input, key) => {
		if (orders.length === 0) return;

		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => Math.min(orders.length - 1, prev + 1));
		}
	});

	// Auto-scroll logic
	useEffect(() => {
		if (orders.length === 0) return;

		const maxVisibleItems = Math.max(1, Math.floor((height - 8) / 8)); // ~8 lines per order item

		// Scroll down if selected item is below visible area
		if (selectedIndex >= scrollOffset + maxVisibleItems) {
			setScrollOffset(selectedIndex - maxVisibleItems + 1);
		}
		// Scroll up if selected item is above visible area
		else if (selectedIndex < scrollOffset) {
			setScrollOffset(selectedIndex);
		}
	}, [selectedIndex, orders.length, height]);

	// Reset scroll when orders change significantly
	useEffect(() => {
		if (selectedIndex >= orders.length && orders.length > 0) {
			setSelectedIndex(orders.length - 1);
		}
	}, [orders.length, selectedIndex]);

	const maxVisibleItems = Math.max(1, Math.floor((height - 8) / 8));
	const visibleOrders = orders.slice(
		scrollOffset,
		scrollOffset + maxVisibleItems,
	);

	return (
		<Box flexDirection="column" padding={1}>
			<Box
				borderStyle="double"
				borderColor="green"
				padding={1}
				marginBottom={1}
			>
				<Text bold color="green">
					🍳 Kitchen Screen - Real-time Orders
				</Text>
			</Box>

			{/* Connection Status */}
			<Box marginBottom={1}>
				<Text>
					Status:{' '}
					<Text
						color={
							connectionStatus === 'connected'
								? 'green'
								: connectionStatus === 'connecting'
								? 'yellow'
								: 'red'
						}
					>
						{connectionStatus === 'connected'
							? '● Connected'
							: connectionStatus === 'connecting'
							? '◐ Connecting...'
							: '✖ Disconnected'}
					</Text>
				</Text>
			</Box>

			{errorMessage && (
				<Box marginBottom={1}>
					<Text color="red">Error: {errorMessage}</Text>
				</Box>
			)}

			{/* Orders List */}
			{orders.length === 0 ? (
				<Box borderStyle="round" padding={1}>
					<Text dimColor>No orders yet. Waiting for new orders...</Text>
				</Box>
			) : (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>
							Total Orders: <Text bold>{orders.length}</Text>
						</Text>
						{orders.length > maxVisibleItems && (
							<Text dimColor>
								{' '}
								(Showing {scrollOffset + 1}-
								{Math.min(scrollOffset + maxVisibleItems, orders.length)})
							</Text>
						)}
					</Box>

					{visibleOrders.map((order, index) => (
						<OrderItem
							key={order._id}
							order={order}
							menu={menu}
							selected={scrollOffset + index === selectedIndex}
						/>
					))}

					{orders.length > maxVisibleItems && (
						<Box marginTop={1}>
							<Text dimColor>
								Use ↑↓ arrow keys to navigate • Scroll: {scrollOffset + 1}/
								{orders.length - maxVisibleItems + 1}
							</Text>
						</Box>
					)}
				</Box>
			)}

			{/* Help Text */}
			<Box marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
				<Text dimColor>↑↓: Navigate orders</Text>
			</Box>
		</Box>
	);
}
