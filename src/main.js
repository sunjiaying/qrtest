import Vue from 'vue';
import App from './App.vue';
import { router } from './router';
import VueSocketIO from 'vue-socket.io';

Vue.use(new VueSocketIO({
  debug: false,
  connection: 'http://212.64.68.222:8000'
}));

new Vue({
  router,
  el: '#app',
  render: h => h(App)
});
