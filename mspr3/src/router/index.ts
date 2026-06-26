import { createRouter, createWebHistory } from 'vue-router';
import LoginRegister from '../views/LoginRegister.vue';
import Feed from '../views/Feed.vue';
import CreateContent from '../views/CreateContent.vue';
import ProfileSettings from '../views/ProfileSettings.vue';
import MyPosts from '../views/MyPosts.vue';

const routes = [
  { path: '/', name: 'Auth', component: LoginRegister },
  { path: '/feed', name: 'Feed', component: Feed, meta: { requiresAuth: true } },
  { path: '/create', name: 'Create', component: CreateContent, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: ProfileSettings, meta: { requiresAuth: true } },
  { path: '/my-posts', name: 'MyPosts', component: MyPosts, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(), 
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    // Not logged in, redirect to login
    next({ name: 'Auth' });
  } else if (to.name === 'Auth' && token) {
    // Already logged in, skip login and go to feed
    next({ name: 'Feed' });
  } else {
    next();
  }
});

export default router;