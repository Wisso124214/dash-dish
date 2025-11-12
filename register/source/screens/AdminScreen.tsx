import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {useStdoutDimensions} from '../lib/hooks/useStdoutDimensions.js';
import {
	fetchOrders,
	fetchMenu,
	subscribeToOrderUpdates,
} from '../lib/apiManager.js';
import {ScrollArea} from '../components/ScrollArea.js';
import {OrderItem} from '../components/OrderItem.js';
import type {Order, Dish} from '../lib/types/index.js';

type TabType = 'orders' | 'filters' | 'realtime';
const tabs = ['orders', 'filters', 'realtime'] as const;
interface FilterState {
	orderType: 'all' | 'dinein' | 'delivery';
	minDate: string;
	maxDate: string;
}

export default function AdminScreen() {
	const [activeTab, setActiveTab] = useState<TabType>('orders');
	const [filters, setFilters] = useState<FilterState>({
		orderType: 'all',
		minDate: '',
		maxDate: '',
	});

	// Handle tab switching with Ctrl + 1, 2, 3
	useInput((input, key) => {
		if (key.ctrl) {
			if (input === '1') {
				setActiveTab('orders');
			} else if (input === '2') {
				setActiveTab('filters');
			} else if (input === '3') {
				setActiveTab('realtime');
			}
		}
		if (input === ' ') {
			const currentIndex = tabs.indexOf(activeTab);
			const nextIndex = (currentIndex + 1) % tabs.length;

			setActiveTab(tabs[nextIndex] ?? 'orders');
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="double" borderColor="cyan" padding={1} marginBottom={1}>
				<Text bold color="cyan">
					📊 Admin Dashboard
				</Text>
			</Box>

			{/* Tab Navigation */}
			<Box marginBottom={1} gap={2}>
				<Text color={activeTab === 'orders' ? 'cyan' : 'gray'}>
					{activeTab === 'orders' ? '►' : ' '} [Ctrl+1] Orders
				</Text>
				<Text color={activeTab === 'filters' ? 'cyan' : 'gray'}>
					{activeTab === 'filters' ? '►' : ' '} [Ctrl+2] Filters
				</Text>
				<Text color={activeTab === 'realtime' ? 'cyan' : 'gray'}>
					{activeTab === 'realtime' ? '►' : ' '} [Ctrl+3] Real-time
				</Text>
			</Box>

			{/* Tab Content */}
			{activeTab === 'orders' && <OrdersTab filters={filters} />}
			{activeTab === 'filters' && (
				<FiltersTab filters={filters} setFilters={setFilters} />
			)}
			{activeTab === 'realtime' && <RealtimeTab />}
		</Box>
	);
}

// Tab 1: View Orders (sorted by created_at)
function OrdersTab({filters}: {filters: FilterState}) {
	const [orders, setOrders] = useState<Order[]>([]);
	const [menu, setMenu] = useState<Dish[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');
	const [_, height] = useStdoutDimensions();

	// Validate date format YYYY-MM-DD
	const validateDate = (dateStr: string): boolean => {
		if (dateStr === '') return true;
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		if (!regex.test(dateStr)) return false;
		const date = new Date(dateStr);
		return date instanceof Date && !isNaN(date.getTime());
	};

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);

				// Build filter object
				const apiFilters: any = {};

				if (filters.orderType !== 'all') {
					apiFilters.type = filters.orderType;
				}

				if (filters.minDate && validateDate(filters.minDate)) {
					apiFilters.from_date = new Date(filters.minDate);
				}

				if (filters.maxDate && validateDate(filters.maxDate)) {
					apiFilters.to_date = new Date(filters.maxDate);
				}

				const [fetchedOrders, fetchedMenu] = await Promise.all([
					fetchOrders(
						Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
					),
					fetchMenu(),
				]);

				// Sort orders by created_at (newest first)
				const sortedOrders = fetchedOrders.sort((a, b) => {
					const dateA = new Date(a.created_at).getTime();
					const dateB = new Date(b.created_at).getTime();
					return dateB - dateA;
				});

				setOrders(sortedOrders);
				setMenu(fetchedMenu);
				setError('');
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load data');
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [filters]);

	const scrollAreaHeight = Math.max(10, height - 12);

	if (loading) {
		return (
			<Box borderStyle="round" padding={1}>
				<Text color="yellow">Loading orders...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box borderStyle="round" padding={1} borderColor="red">
				<Text color="red">Error: {error}</Text>
			</Box>
		);
	}

	if (orders.length === 0) {
		return (
			<Box borderStyle="round" padding={1}>
				<Text dimColor>No orders found</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text>
					Total Orders:{' '}
					<Text bold color="cyan">
						{orders.length}
					</Text>
				</Text>
			</Box>

			<ScrollArea height={scrollAreaHeight}>
				{orders.map(order => (
					<OrderItem
						key={order._id || Math.random()}
						order={order}
						menu={menu}
					/>
				))}
			</ScrollArea>

			<Box marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
				<Text dimColor>Use ↑↓ to scroll • Ctrl+2 for filters</Text>
			</Box>
		</Box>
	);
}

// Tab 2: Filter Form
function FiltersTab({
	filters,
	setFilters,
}: {
	filters: FilterState;
	setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}) {
	const orderType = filters.orderType;
	const minDate = filters.minDate;
	const maxDate = filters.maxDate;

	const [activeField, setActiveField] = useState<
		'type' | 'minDate' | 'maxDate'
	>('type');
	const [minDateError, setMinDateError] = useState('');
	const [maxDateError, setMaxDateError] = useState('');

	// Validate date format YYYY-MM-DD
	const validateDate = (dateStr: string): boolean => {
		if (dateStr === '') return true; // Empty is valid
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		if (!regex.test(dateStr)) return false;

		const date = new Date(dateStr);
		return date instanceof Date && !isNaN(date.getTime());
	};

	// Handle keyboard navigation
	useInput((_, key) => {
		// Navigate between fields with Tab
		if (key.tab) {
			if (activeField === 'type') setActiveField('minDate');
			else if (activeField === 'minDate') setActiveField('maxDate');
			else setActiveField('type');
		}

		// Toggle order type when on type field
		if (activeField === 'type' && (key.leftArrow || key.rightArrow)) {
			let newType: 'all' | 'dinein' | 'delivery';
			if (orderType === 'all') newType = 'dinein';
			else if (orderType === 'dinein') newType = 'delivery';
			else newType = 'all';

			setFilters(prev => ({...prev, orderType: newType}));
		}
	});

	// Handle min date changes
	const handleMinDateChange = (value: string) => {
		setFilters(prev => ({...prev, minDate: value}));
		if (value === '' || validateDate(value)) {
			setMinDateError('');
		} else {
			setMinDateError('Invalid format. Use YYYY-MM-DD');
		}
	};

	// Handle max date changes
	const handleMaxDateChange = (value: string) => {
		setFilters(prev => ({...prev, maxDate: value}));
		if (value === '' || validateDate(value)) {
			setMaxDateError('');
		} else {
			setMaxDateError('Invalid format. Use YYYY-MM-DD');
		}
	};

	return (
		<Box flexDirection="column">
			<Box borderStyle="round" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text bold color="cyan">
						Filter Orders
					</Text>
					<Text dimColor>Use Tab to navigate fields</Text>
				</Box>
			</Box>

			{/* Order Type Filter */}
			<Box flexDirection="column" marginBottom={1}>
				<Box>
					<Text bold color={activeField === 'type' ? 'cyan' : 'white'}>
						{activeField === 'type' ? '► ' : '  '}Order Type:
					</Text>
				</Box>
				<Box marginLeft={2}>
					<Text color={orderType === 'all' ? 'green' : 'gray'}>
						[{orderType === 'all' ? '●' : ' '}] All
					</Text>
					<Text> </Text>
					<Text color={orderType === 'dinein' ? 'green' : 'gray'}>
						[{orderType === 'dinein' ? '●' : ' '}] Dine-in
					</Text>
					<Text> </Text>
					<Text color={orderType === 'delivery' ? 'green' : 'gray'}>
						[{orderType === 'delivery' ? '●' : ' '}] Delivery
					</Text>
				</Box>
				{activeField === 'type' && (
					<Box marginLeft={2}>
						<Text dimColor>Press Space/Arrow keys to change</Text>
					</Box>
				)}
			</Box>

			{/* Min Date Filter */}
			<Box flexDirection="column" marginBottom={1}>
				<Box>
					<Text bold color={activeField === 'minDate' ? 'cyan' : 'white'}>
						{activeField === 'minDate' ? '► ' : '  '}From Date (YYYY-MM-DD):
					</Text>
				</Box>
				<Box marginLeft={2}>
					{activeField === 'minDate' ? (
						<TextInput
							value={minDate}
							onChange={handleMinDateChange}
							placeholder="2025-01-01"
						/>
					) : (
						<Text color={minDate ? 'white' : 'gray'}>
							{minDate || '(not set)'}
						</Text>
					)}
				</Box>
				{minDateError && (
					<Box marginLeft={2}>
						<Text color="red">{minDateError}</Text>
					</Box>
				)}
				{activeField === 'minDate' && !minDateError && (
					<Box marginLeft={2}>
						<Text dimColor>Example: 2025-11-01</Text>
					</Box>
				)}
			</Box>

			{/* Max Date Filter */}
			<Box flexDirection="column" marginBottom={1}>
				<Box>
					<Text bold color={activeField === 'maxDate' ? 'cyan' : 'white'}>
						{activeField === 'maxDate' ? '► ' : '  '}To Date (YYYY-MM-DD):
					</Text>
				</Box>
				<Box marginLeft={2}>
					{activeField === 'maxDate' ? (
						<TextInput
							value={maxDate}
							onChange={handleMaxDateChange}
							placeholder="2025-12-31"
						/>
					) : (
						<Text color={maxDate ? 'white' : 'gray'}>
							{maxDate || '(not set)'}
						</Text>
					)}
				</Box>
				{maxDateError && (
					<Box marginLeft={2}>
						<Text color="red">{maxDateError}</Text>
					</Box>
				)}
				{activeField === 'maxDate' && !maxDateError && (
					<Box marginLeft={2}>
						<Text dimColor>Example: 2025-11-30</Text>
					</Box>
				)}
			</Box>

			{/* Current Filters Summary */}
			<Box borderStyle="round" padding={1} marginTop={1} borderColor="green">
				<Box flexDirection="column">
					<Text bold color="green">
						Active Filters:
					</Text>
					<Text>
						Type: <Text color="cyan">{orderType}</Text>
					</Text>
					<Text>
						From: <Text color="cyan">{minDate || '(any)'}</Text>
					</Text>
					<Text>
						To: <Text color="cyan">{maxDate || '(any)'}</Text>
					</Text>
				</Box>
			</Box>

			{/* Help Text */}
			<Box marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
				<Text dimColor>
					Tab: Next field • Space/Arrows: Toggle type • Ctrl+1: View filtered
					orders
				</Text>
			</Box>
		</Box>
	);
}

// Tab 3: Real-time Orders Queue (view only, no selection)
function RealtimeTab() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [menu, setMenu] = useState<Dish[]>([]);
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
						const existingIndex = prevOrders.findIndex(
							o => o._id === order._id,
						);
						if (existingIndex !== -1) {
							const newOrders = [...prevOrders];
							newOrders[existingIndex] = order;
							return newOrders;
						} else {
							return [order, ...prevOrders];
						}
					});
				},
				(error: Error) => {
					setConnectionStatus('error');
					setErrorMessage(error.message);
				},
			);

			ws.on('open', () => {
				setConnectionStatus('connected');
				setErrorMessage('');
			});

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

	const scrollAreaHeight = Math.max(10, height - 15);

	return (
		<Box flexDirection="column">
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
							Total Orders:{' '}
							<Text bold color="cyan">
								{orders.length}
							</Text>
						</Text>
					</Box>

					<ScrollArea height={scrollAreaHeight}>
						{orders.map(order => (
							<OrderItem
								key={order._id || Math.random()}
								order={order}
								menu={menu}
							/>
						))}
					</ScrollArea>
				</Box>
			)}

			{/* Help Text */}
			<Box marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
				<Text dimColor>↑↓: Scroll through orders • Ctrl+1 for order list</Text>
			</Box>
		</Box>
	);
}
