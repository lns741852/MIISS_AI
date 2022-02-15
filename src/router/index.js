import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
    // mode: 'history',
    routes: [
        {
            path: '/',
            name: 'index_login',
            component: () =>
                import('../components/Public/Login.vue')
        },
        {
            path: '/Pathology',
            name: 'Pathology',
            component: () =>
                import('../components/Public/Pathology.vue')
        },
        {
            path: '/login',
            name: 'Login',
            component: () =>
                import('../components/Public/Login.vue')
        },
        {
            path: '/relay',
            name: 'Relay',
            component: () =>
                import('../components/Public/Relay.vue')
        },
        {
            path: '/profile',
            name: 'Profile',
            component: () =>
                import('../components/User/Profile.vue')
        },
        {
            path: '/ctrl/editprofile',
            name: 'EditProfile',
            component: () =>
                import('../components/Admin/EditProfile.vue')
        },
        {
            path: '/resetPW',
            name: 'resetPW',
            component: () =>
                import('../components/User/ResetPW.vue')
        },
        {
            path: '/retrievepw',
            name: 'RetrievePW',
            component: () =>
                import('../components/Public/RetrievePW.vue')
        },
        {
            path: '/ctrl/admin',
            name: 'Admin',
            component: () =>
                import('../components/Admin/Admin.vue')
        },
        {
            path: '/ctrl/addaccess',
            name: 'AddAccess',
            component: () =>
                import('../components/Admin/AddAccess.vue')
        },
        /* {
            path: '/ctrl/list',
            name: 'adminList',
            component: () =>
                import('../components/Admin/List.vue')
        }, */
        {
            path: '/list',
            name: 'List',
            component: () =>
                import('../components/User/List.vue')
        },
        {
            path: '/case',
            name: 'Case',
            component: () =>
                import('../components/User/Case.vue')
        },
        {
            path: '/ctrl/ClassEdit',
            name: 'ClassEdit',
            component: () =>
                import('../components/Admin/ClassEdit.vue')
        },
        /* {
            path: '/test',
            name: 'test',
            component: () =>
                import('../components/test.vue')
        }, */
        {
            path: '*',
            redirect: '/Login',
        }
    ]
})

router.beforeEach((to, from, next) => {
    const publicPages = ['/', '/Pathology', '/retrievepw', '/login', '/relay', '/test'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('user');

    // trying to access a restricted page + not logged in
    // redirect to login page
    if (authRequired && !loggedIn) {
        next('/login');
    } else {
        next();
    }
});

export default router