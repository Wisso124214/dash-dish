import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import { login } from '../lib/apiManager.js';
import { sessionAtom } from '../lib/atoms.js';
import { screenAtom } from '../lib/atoms.js';
import { useSetAtom } from 'jotai';



export default function LoginScreen() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [focusedField, setFocusedField] = useState<'email' | 'password'>(
		'email',
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const setSession = useSetAtom(sessionAtom);
	const setScreen = useSetAtom(screenAtom);

	useInput((_input, key) => {
		if (isLoading) return;

		if (key.return) {
			if (focusedField === 'email' && email) {
				setFocusedField('password');
			} else if (focusedField === 'password' && password) {
				handleLogin();
			}
		}

		if (key.tab || key.upArrow || key.downArrow) {
			setFocusedField(focusedField === 'email' ? 'password' : 'email');
		}
	});

	const handleLogin = async () => {
		if (!email || !password) {
			setError('Email and password are required');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const data = await login(email, password);
			setSession({ email: email, role: data.role, sessionId: data.session_id });
			setScreen(data.role);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Connection failed');
			setIsLoading(false);
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Box marginBottom={1}>
				<Text bold color="cyan">
					Superrestaurant Login
				</Text>
			</Box>

			<Box flexDirection="column" borderStyle="round" padding={1}>
				{/* Email Field */}
				<Box marginBottom={1}>
					<Box width={12}>
						<Text color={focusedField === 'email' ? 'green' : 'gray'}>
							Email:{' '}
						</Text>
					</Box>
					<Box>
						{focusedField === 'email' ? (
							<TextInput
								value={email}
								onChange={setEmail}
								placeholder="user@example.com"
							/>
						) : (
							<Text>{email || <Text dimColor>(empty)</Text>}</Text>
						)}
					</Box>
				</Box>

				{/* Password Field */}
				<Box marginBottom={1}>
					<Box width={12}>
						<Text color={focusedField === 'password' ? 'green' : 'gray'}>
							Password:{' '}
						</Text>
					</Box>
					<Box>
						{focusedField === 'password' ? (
							<TextInput
								value={password}
								onChange={setPassword}
								mask="*"
								placeholder="••••••••"
							/>
						) : (
							<Text>
								{password ? '••••••••' : <Text dimColor>(empty)</Text>}
							</Text>
						)}
					</Box>
				</Box>

				{/* Instructions */}
				<Box marginTop={1} marginBottom={1}>
					<Text dimColor>
						{isLoading
							? 'Logging in...'
							: `Press Tab to switch fields, Enter to ${
									focusedField === 'email' ? 'continue' : 'login'
							  }`}
					</Text>
				</Box>

				{/* Error Message */}
				{error && (
					<Box marginTop={1}>
						<Text color="red">✗ {error}</Text>
					</Box>
				)}
			</Box>
		</Box>
	);
}
