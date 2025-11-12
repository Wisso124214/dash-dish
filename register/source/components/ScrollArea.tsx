import React, {
	useReducer,
	useRef,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from 'react';
import {Box, useInput, measureElement} from 'ink';

interface ScrollState {
	height: number;
	scrollTop: number;
	innerHeight?: number;
}

type ScrollAction =
	| {type: 'SET_INNER_HEIGHT'; innerHeight: number}
	| {type: 'SCROLL_DOWN'}
	| {type: 'SCROLL_UP'}
	| {type: 'SCROLL_TO'; scrollTop: number};

const reducer = (state: ScrollState, action: ScrollAction): ScrollState => {
	switch (action.type) {
		case 'SET_INNER_HEIGHT':
			return {
				...state,
				innerHeight: action.innerHeight,
			};

		case 'SCROLL_DOWN':
			return {
				...state,
				scrollTop: Math.min(
					(state.innerHeight || 0) - state.height,
					state.scrollTop + 1,
				),
			};

		case 'SCROLL_UP':
			return {
				...state,
				scrollTop: Math.max(0, state.scrollTop - 1),
			};

		case 'SCROLL_TO':
			return {
				...state,
				scrollTop: Math.max(
					0,
					Math.min((state.innerHeight || 0) - state.height, action.scrollTop),
				),
			};

		default:
			return state;
	}
};

interface ScrollAreaProps {
	height: number;
	children: React.ReactNode;
	enableScrollKeys?: boolean;
}

export interface ScrollAreaRef {
	scrollTo: (scrollTop: number) => void;
	scrollDown: () => void;
	scrollUp: () => void;
}

export const ScrollArea = forwardRef<ScrollAreaRef, ScrollAreaProps>(
	({height, children, enableScrollKeys = true}, ref) => {
		const [state, dispatch] = useReducer(reducer, {
			height,
			scrollTop: 0,
		});

		const innerRef = useRef<any>(null);

		useImperativeHandle(ref, () => ({
			scrollTo: (scrollTop: number) => {
				dispatch({
					type: 'SCROLL_TO',
					scrollTop,
				});
			},
			scrollDown: () => {
				dispatch({
					type: 'SCROLL_DOWN',
				});
			},
			scrollUp: () => {
				dispatch({
					type: 'SCROLL_UP',
				});
			},
		}));

		useEffect(() => {
			if (innerRef.current) {
				const dimensions = measureElement(innerRef.current);

				dispatch({
					type: 'SET_INNER_HEIGHT',
					innerHeight: dimensions.height,
				});
			}
		}, [children]);

		useInput(
			(_input, key) => {
				if (key.downArrow) {
					dispatch({
						type: 'SCROLL_DOWN',
					});
				}

				if (key.upArrow) {
					dispatch({
						type: 'SCROLL_UP',
					});
				}
			},
			{isActive: enableScrollKeys},
		);

		return (
			<Box height={height} flexDirection="column" overflow="hidden">
				<Box
					ref={innerRef}
					flexShrink={0}
					flexDirection="column"
					marginTop={-state.scrollTop}
				>
					{children}
				</Box>
			</Box>
		);
	},
);
