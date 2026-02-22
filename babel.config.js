module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // 웹 번들에서 ESM 패키지(zustand 등)의 import.meta를 변환해 'outside a module' 에러 방지
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
