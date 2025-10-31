import React, {useState} from 'react';
import {Text, Box} from 'ink';
import LoginScreen from './components/LoginScreen.js';

export default function App() {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [userEmail, setUserEmail] = useState<string>('');

	const handleLoginSuccess = (session: string, email: string) => {
		setSessionId(session);
		setUserEmail(email);
	};

	if (!sessionId) {
		return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
	}

	return (
		<Box margin={1} flexDirection="column">
			<Box marginBottom={1} borderStyle="round" paddingX={2}>
				<Text color="green">✓ Logged in as: {userEmail}</Text>
			</Box>
			<Box borderStyle="single" padding={1}>
				<Text>Welcome to DashDish Register</Text>
			</Box>
		</Box>
	);
}
