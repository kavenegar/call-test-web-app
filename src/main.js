import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import Buefy from 'buefy'

Vue.config.productionTip = false;
Vue.use(Buefy);


Vue.mixin({
    mounted() {
    },
    methods: {
        en2fa(num) {
            let arr = [];
            var result = num;
            var persian = {0: '۰', 1: '۱', 2: '۲', 3: '۳', 4: '۴', 5: '۵', 6: '۶', 7: '۷', 8: '۸', 9: '۹'};
            for (let number in persian) {
                result = result.replaceAll(number, persian[number]);
            }
            return result;
        },
        nl2br(str) {
            return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
        },
        dayjs(date) {
            return dayjs(date).calendar('jalali').locale('fa');
        }
    }
});

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
