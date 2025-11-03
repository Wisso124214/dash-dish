import React from 'react';
import {useStdout} from 'ink';

export function useStdoutDimensions(): [number, number] {
	const {stdout} = useStdout();
	const [dimensions, setDimensions] = React.useState<[number, number]>([
		stdout.columns || 80,
		stdout.rows || 24,
	]);

	React.useEffect(() => {
		const handleResize = () => {
			setDimensions([stdout.columns || 80, stdout.rows || 24]);
		};

		stdout.on('resize', handleResize);
		return () => {
			stdout.off('resize', handleResize);
		};
	}, [stdout]);

	return dimensions;
}
