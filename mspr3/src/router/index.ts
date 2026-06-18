import { createRouter, createWebHistory } from 'vue-router';
import LoginRegister from '../views/LoginRegister.vue';
import Feed from '../views/Feed.vue';
import CreateContent from '../views/CreateContent.vue';
import ProfileSettings from '../views/ProfileSettings.vue';
import MyPosts from '../views/MyPosts.vue';

const routes = [
  { path: '/', name: 'Auth', component: LoginRegister },
  { path: '/feed', name: 'Feed', component: Feed },
  { path: '/create', name: 'Create', component: CreateContent },
  { path: '/profile', name: 'Profile', component: ProfileSettings },
  { path: '/my-posts', name: 'MyPosts', component: MyPosts },
];

const router = createRouter({
  history: createWebHistory(), 
  routes,
});

export default router;