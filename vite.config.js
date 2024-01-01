import ViteWorkerPlugin from 'worker-plugin';

export default {
  plugins: [ViteWorkerPlugin()],
  build: {
    target: 'esnext', // or your desired target
  },
};
