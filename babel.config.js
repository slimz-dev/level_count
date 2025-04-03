module.exports = {
	presets: ['react-app'],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				alias: {
					'@com': './src',
				},
			},
		],
	],
};
