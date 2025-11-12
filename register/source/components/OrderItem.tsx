import React from 'react';
import type {Order, Dish} from '../lib/types/index.js';
import {Text, Box} from 'ink';

export function OrderItem({
	order,
	menu,
	selected = false,
}: {
	order: Order;
	menu: Dish[];
	selected?: boolean;
}) {
	return (
		<Box
			flexDirection="column"
			borderStyle={selected ? 'double' : 'round'}
			padding={1}
			marginBottom={1}
			borderColor={selected ? 'blue' : 'default'}
			flexShrink={0}
		>
			<Text bold={selected} color={selected ? 'blue' : undefined}>
				{selected ? '► ' : '  '}Order ID: {order._id}
			</Text>
			<Text>Total Cost: ${order.total_cost.toFixed(2)}</Text>
			<Text>Status: {order.status}</Text>
			<Text>Type: {order.type}</Text>
			<Text>Created At: {new Date(order.created_at).toLocaleString()}</Text>
			{order.updated_at && (
				<Text>Updated At: {new Date(order.updated_at).toLocaleString()}</Text>
			)}
			<Text>Items:</Text>
			{order.items.map((item, index) => (
				<Box key={index} flexDirection="column" marginLeft={2} marginBottom={1}>
					<Text>
						Dish:{' '}
						{menu.find(dish => dish._id === item.id_dish)?.title ?? 'Unknown'} |
						Quantity: {item.quantity}
					</Text>
					{item.selected_extras && item.selected_extras.length > 0 && (
						<Box flexDirection="column" marginLeft={2}>
							<Text>Selected Extras:</Text>
							{item.selected_extras.map((extra, extraIndex) => (
								<Text key={extraIndex}>
									- {extra.name} (${extra.cost.toFixed(2)})
								</Text>
							))}
						</Box>
					)}
				</Box>
			))}
		</Box>
	);
}
