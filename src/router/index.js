import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Authorize from "../views/Authorize";
import Login from "../views/Login";
import Call from "../views/Call";
import Endpoints from "../views/Endpoints";
import Profile from "../views/Profile";
import Menu from "../views/Menu";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Calls',
        component: Home
    },
    {
        path: '/call/:id/:accessToken',
        name: 'Calls',
        component: Call
    },
    {
        path: '/endpoints',
        name: 'Endpoints',
        component: Endpoints
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile
    },
    {
        path: '/menu',
        name: 'Menu',
        component: Menu
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/authorize',
        name: 'Authorize',
        component: Authorize
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

router.beforeEach((to, from, next) => {
    var path = to.path;
    if (path === '/authorize' || path === '/login') {
        return next();
    }

    if (localStorage.getItem("ApplicationToken") == null) {
        return next('/authorize');
    }

    if (localStorage.getItem("AuthenticatedEndpoint") == null) {
        return next('/login');
    }

    next();

});


export default router
