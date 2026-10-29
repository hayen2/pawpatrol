import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: '/customer-login.html'
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        customerLogin: 'customer-login.html',
        adminLogin: 'login.html',
        customer: 'Customer.html'
      }
    }
  }
});