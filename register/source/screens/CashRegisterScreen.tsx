import {fetchMenu, submitOrder} from '../lib/apiManager.js';
import React, {useState, useMemo} from 'react';
import {Text, Box, Newline, useInput} from 'ink';
import {MenuItem} from '../components/MenuItem.js';
import {Dish} from '../lib/types/dish.js';
import {useStdoutDimensions} from '../lib/hooks/useStdoutDimensions.js';

export default function CashRegisterScreen() {
	const [menu, setMenu] = useState<Dish[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [_, height] = useStdoutDimensions();
	const [tab, setTab] = useState<'menu' | 'order'>('menu');
	const [order, setOrder] = useState<Dish[]>([]);
	const [scrollOffset, setScrollOffset] = useState(0);
	const [statusMessage, setStatusMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	React.useEffect(() => {
		async function loadMenu() {
			const fetchedMenu = await fetchMenu();
			setMenu(fetchedMenu);
		}
		loadMenu();
	}, []);

	const orderTotal = useMemo(() => {
		return order.reduce((total, dish) => total + dish.cost_unit, 0);
	}, [order]);

	// Clear status message after 5 seconds
	React.useEffect(() => {
		if (statusMessage) {
			const timer = setTimeout(() => {
				setStatusMessage(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [statusMessage]);

	const handleSubmitOrder = async () => {
		if (order.length === 0) {
			setStatusMessage({
				type: 'error',
				text: 'Cannot submit empty order',
			});
			return;
		}

		setIsSubmitting(true);
		setStatusMessage(null);

		try {
			// Group dishes by id and count quantities
			const dishMap = new Map<string, number>();
			order.forEach(dish => {
				const dishId = dish._id!;
				dishMap.set(dishId, (dishMap.get(dishId) || 0) + 1);
			});

			// Convert to OrderItem array
			const orderItems = Array.from(dishMap.entries()).map(([id_dish, quantity]) => ({
				id_dish,
				quantity,
			}));

			// Submit order
      await submitOrder(orderItems);

			setStatusMessage({
				type: 'success',
				text: `Order submitted successfully! Total: $${orderTotal.toFixed(2)}`,
			});

			// Clear order after successful submission
			setOrder([]);
			setSelectedIndex(0);
			setScrollOffset(0);
		} catch (error) {
			setStatusMessage({
				type: 'error',
				text: `Failed to submit order: ${
					error instanceof Error ? JSON.stringify(error.message) : 'Unknown error'
				}`,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Calculate how many items can fit on screen
	// Reserve lines for: title (1) + instructions (2) + newlines (2) + border/padding (4) = ~9 lines
	const reservedLines = 9;
	const maxVisibleItems = Math.max(1, height - reservedLines);

	// Update scroll offset when selectedIndex changes
	React.useEffect(() => {
		if (selectedIndex < scrollOffset) {
			// Scrolling up
			setScrollOffset(selectedIndex);
		} else if (selectedIndex >= scrollOffset + maxVisibleItems) {
			// Scrolling down
			setScrollOffset(selectedIndex - maxVisibleItems + 1);
		}
	}, [selectedIndex, maxVisibleItems, scrollOffset]);

	useInput((input, key) => {
		const currentList = tab === 'menu' ? menu : order;
		const maxIndex = Math.max(0, currentList.length - 1);

		if (key.upArrow) {
			setSelectedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
		} else if (key.downArrow) {
			setSelectedIndex(prevIndex =>
				prevIndex < maxIndex ? prevIndex + 1 : maxIndex,
			);
		}
		if (key.tab) {
			setTab(prevTab => (prevTab === 'menu' ? 'order' : 'menu'));
			setSelectedIndex(0);
			setScrollOffset(0);
		}
		if (key.return) {
			if (tab === 'menu') {
				const item = menu[selectedIndex];
				if (item) {
					setOrder(prevOrder => [...prevOrder, item]);
				}
			}
		}
		if (key.delete || key.backspace) {
			if (tab === 'order' && order.length > 0) {
				setOrder(prevOrder => prevOrder.filter((_, i) => i !== selectedIndex));
				// Adjust selectedIndex if we removed the last item
				if (selectedIndex >= order.length - 1) {
					setSelectedIndex(Math.max(0, order.length - 2));
				}
			}
		}
		if (key.ctrl && input === 's') {
			if (tab === 'order' && !isSubmitting) {
				handleSubmitOrder();
			}
		}
	});

	// Get visible slice of menu items
	const visibleMenu = menu.slice(scrollOffset, scrollOffset + maxVisibleItems);
	const showScrollIndicator = menu.length > maxVisibleItems;

	// For order tab: calculate visible items and scrolling
	const visibleOrder = order.slice(
		scrollOffset,
		scrollOffset + maxVisibleItems,
	);
	const showOrderScrollIndicator = order.length > maxVisibleItems;

	if (tab === 'menu') {
		return (
			<Box flexDirection="column" padding={1} borderStyle="single">
				<Text color="cyan" bold>
					Cash Register Menu
				</Text>
				<Text>
					Use Up/Down arrows to navigate the menu items. Enter to select.
					<Newline />
					Use Tab to switch tabs (menu, current order)
				</Text>
				<Newline />
				{menu.length === 0 ? (
					<Text>Loading menu...</Text>
				) : (
					<>
						{visibleMenu.map((dish, visibleIndex) => {
							const actualIndex = scrollOffset + visibleIndex;
							return (
								<MenuItem
									key={dish._id}
									dish={dish}
									selected={actualIndex === selectedIndex}
								/>
							);
						})}
						{showScrollIndicator && (
							<Text dimColor>
								{scrollOffset > 0 && '↑ '}
								Showing {scrollOffset + 1}-
								{Math.min(scrollOffset + maxVisibleItems, menu.length)} of{' '}
								{menu.length}
								{scrollOffset + maxVisibleItems < menu.length && ' ↓'}
							</Text>
						)}
					</>
				)}
			</Box>
		);
	}
	return (
		<Box
			flexDirection="column"
			padding={1}
			borderStyle="single"
			height={height}
		>
			<Text color="cyan" bold>
				Current Order{' '}
				{isSubmitting && <Text color="yellow">(Submitting...)</Text>}
			</Text>
			<Text dimColor>
				Use Up/Down arrows to navigate. Delete/Backspace to remove item.
				<Newline />
				Use Tab to switch back to menu
			</Text>
			<Text>
				Total: ${orderTotal.toFixed(2)}.{' '}
				<Text color={isSubmitting ? 'gray' : 'green'}>
					Press Ctrl+S to complete order
				</Text>
			</Text>
			{statusMessage && (
				<Text color={statusMessage.type === 'success' ? 'green' : 'red'} bold>
					{statusMessage.text}
				</Text>
			)}
			<Newline />
			{order.length === 0 ? (
				<Text>No items in the order.</Text>
			) : (
				<>
					{visibleOrder.map((dish, visibleIndex) => {
						const actualIndex = scrollOffset + visibleIndex;
						return (
							<MenuItem
								key={`${dish._id}-${actualIndex}`}
								dish={dish}
								selected={actualIndex === selectedIndex}
								selectedExtraMessage="del to remove"
							/>
						);
					})}
					{showOrderScrollIndicator && (
						<Text dimColor>
							{scrollOffset > 0 && '↑ '}
							Showing {scrollOffset + 1}-
							{Math.min(scrollOffset + maxVisibleItems, order.length)} of{' '}
							{order.length}
							{scrollOffset + maxVisibleItems < order.length && ' ↓'}
						</Text>
					)}
				</>
			)}
		</Box>
	);
}
