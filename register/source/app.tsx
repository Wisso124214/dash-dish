import React from 'react';
import {Text, Box} from 'ink';
import LoginScreen from './screens/LoginScreen.js';
import { useAtomValue } from 'jotai';
import { sessionAtom, screenAtom } from './lib/atoms.js';
import CashRegisterScreen from './screens/CashRegisterScreen.js';
import KitchenScreen from './screens/KitchenScreen.js';
import AdminScreen from './screens/AdminScreen.js';

export default function App() {
	const session = useAtomValue(sessionAtom);
	const screen = useAtomValue(screenAtom);


	if (!session || screen === 'login') {
		return <LoginScreen />;
	}

	if (session.role === "register") {
		return <CashRegisterScreen />;
	}

	if (session.role === "kitchen") {
		return <KitchenScreen />;
	}

	if (session.role === "admin") {
		return <AdminScreen />;
	}

	return (
		<Box margin={1} flexDirection="column">
			<Box marginBottom={1} borderStyle="round" paddingX={2}>
				<Text color="green">✓ Logged in as: {session.email}, Role: {session.role}</Text>
			</Box>
			<Box borderStyle="single" padding={1}>
				<Text>Welcome to DashDish Register</Text>
			</Box>
		</Box>
	);
}
