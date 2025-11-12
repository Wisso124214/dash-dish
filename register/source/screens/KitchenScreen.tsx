import React, {useState, useEffect, useRef} from 'react';
import {Text, Box, useInput, measureElement} from 'ink';
import {subscribeToOrderUpdates, fetchMenu, updateOrderStatus} from '../lib/apiManager.js';
import {OrderItem} from '../components/OrderItem.js';
import {ScrollArea, type ScrollAreaRef} from '../components/ScrollArea.js';
import type {Order, Dish} from '../lib/types/index.js';
import { useStdoutDimensions } from '../lib/hooks/useStdoutDimensions.js';

export default function KitchenScreen() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [menu, setMenu] = useState<Dish[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [_, height] = useStdoutDimensions();
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'error'
	>('connecting');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const scrollAreaRef = useRef<ScrollAreaRef>(null);
	const orderRefs = useRef<Map<string, any>>(new Map());

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
				const fetchedMenu = await fetchMenu();
				setMenu(fetchedMenu);
			} catch (error) {
				console.error('Failed to load menu:', error);
			}
		}
		loadMenu();
	}, []);

	// Reset selection if it's out of bounds
	useEffect(() => {
		if (orders.length > 0 && selectedIndex >= orders.length) {
			setSelectedIndex(orders.length - 1);
		} else if (orders.length === 0) {
			setSelectedIndex(0);
		}
	}, [orders.length, selectedIndex]);

	// Handle keyboard navigation for order selection
	useInput((_input, key) => {
		if (orders.length === 0) return;

		if (key.upArrow) {
			setSelectedIndex(prev => {
				const newIndex = Math.max(0, prev - 1);
				// Scroll the ScrollArea to show the selected order
				scrollToOrder(newIndex);
				return newIndex;
			});
		} else if (key.downArrow) {
			setSelectedIndex(prev => {
				const newIndex = Math.min(orders.length - 1, prev + 1);
				// Scroll the ScrollArea to show the selected order
				scrollToOrder(newIndex);
				return newIndex;
			});
		}
		else if (key.return) {
			console.log('Enter key pressed to mark order as done');
			const selectedOrder = orders[selectedIndex];
			if (!selectedOrder || !selectedOrder._id) return;
			updateOrderStatus(selectedOrder._id, "done").catch(error => {
				console.error('Failed to update order status:', error);
			});
		}
	});

	// Function to calculate and scroll to a specific order
	const scrollToOrder = (orderIndex: number) => {
		if (!scrollAreaRef.current || orders.length === 0) return;

		const orderId = orders[orderIndex]?._id;
		if (!orderId) return;

		let scrollPosition = 0;
		for (let i = 0; i < orderIndex; i++) {
			const prevOrder = orders[i];
			if (!prevOrder?._id) continue;

			const prevElement = orderRefs.current.get(prevOrder._id);
			if (prevElement) {
				const prevDimensions = measureElement(prevElement);
				scrollPosition += prevDimensions.height;
			}
		}

		scrollAreaRef.current.scrollTo(scrollPosition);
	};

	// Calculate the height for the scroll area
	// Header (3 lines) + Status (2 lines) + Error (if any, 2 lines) + Total orders (2 lines) + Help text (3 lines)
	const headerHeight = 3 + 2 + (errorMessage ? 2 : 0) + 2 + 3;
	const scrollAreaHeight = Math.max(10, height - headerHeight);

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
							Total Orders: <Text bold>{orders.length}</Text> | Selected:{' '}
							<Text bold color="blue">
								{selectedIndex + 1}
							</Text>
						</Text>
					</Box>

					<ScrollArea
						ref={scrollAreaRef}
						height={scrollAreaHeight}
						enableScrollKeys={false}
					>
						{orders.map((order, index) => (
							<Box
								key={order._id || index}
								ref={(el: any) => {
									if (el && order._id) {
										orderRefs.current.set(order._id, el);
									}
								}}
							>
								<OrderItem
									order={order}
									menu={menu}
									selected={index === selectedIndex}
								/>
							</Box>
						))}
					</ScrollArea>
				</Box>
			)}

			{/* Help Text */}
			<Box  borderStyle="round" borderColor="gray">
				<Text dimColor>↑↓: Navigate orders</Text>
				<Text dimColor> | Enter: Mark order as done</Text>
			</Box>
		</Box>
	);
}
