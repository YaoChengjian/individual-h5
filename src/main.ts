import { createApp } from 'vue';
import { store } from './stores';
// normalize.css
import 'normalize.css/normalize.css';
// 全局样式
import './styles/index.scss';
// unocss
import 'virtual:uno.css';
// svg icon
import 'virtual:svg-icons-register';
// vant 通知类组件样式
import 'vant/es/toast/style';
import 'vant/es/dialog/style';
import 'vant/es/notify/style';

import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
