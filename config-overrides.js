const { override, addBabelPlugin } = require('customize-cra');

module.exports = override(
	addBabelPlugin([
		'module-resolver',
		{
			root: ['./src'],
			alias: {
				'@com': './src',
			},
		},
	])
);
