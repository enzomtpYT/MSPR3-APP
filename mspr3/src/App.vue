<template>
  <div id="app-container">
    <main class="main-content">
      <router-view />
    </main>
    <nav v-if="showBottomNav" class="bottom-nav">
      <router-link to="/feed" class="nav-item" active-class="active">
        <small>Feed</small>
      </router-link>
      <router-link to="/create" class="nav-item" active-class="active">
        <small>Créer</small>
      </router-link>
      <router-link to="/my-posts" class="nav-item" active-class="active">
        <small>Mes Posts</small>
      </router-link>
      <router-link to="/profile" class="nav-item" active-class="active">
        <small>Profil</small>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showBottomNav = computed(() => route.path !== '/');

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
});
</script>