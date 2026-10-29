import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    open: '/customer-login.html'
  },
  build: {
    rollupOptions: {
      input: {
        // I-set natin ang customer-login bilang pangunahing entry point
        main: resolve(__dirname, 'customer-login.html'),
        // Isama pa rin natin ang iba para maka-access ka pa rin sa kanila
        adminDashboard: resolve(__dirname, 'index.html'),
        adminLogin: resolve(__dirname, 'login.html'),
        customer: resolve(__dirname, 'Customer.html')
      }
    }
  }
});