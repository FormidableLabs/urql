export default () => ({
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    };

    return config;
  },
});
