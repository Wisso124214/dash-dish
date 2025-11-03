import React from 'react';
import {Dish} from '../lib/types/index.js';
import {Text, Box} from 'ink';

export function MenuItem({
	dish,
	selected,
	qty,
	selectedExtraMessage: selectedExtraMMessage,
}: {
	dish: Dish;
	selected: boolean;
	qty?: number;
	selectedExtraMessage?: string;
}) {
	return (
		<Box flexDirection="column" borderStyle={'round'}>
			<Text color={selected ? 'cyan' : 'white'}>
				{dish.title} - ${dish.cost_unit.toFixed(2)} {qty ? ` x${qty}` : ''}
			</Text>
			{selectedExtraMMessage && selected && (
				<Text dimColor>{selectedExtraMMessage}</Text>
			)}
		</Box>
	);
}
