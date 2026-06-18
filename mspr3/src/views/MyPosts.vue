<template>
  <div class="feed-container">
    <div class="header">
      <h2>Mes Publications</h2>
    </div>
    <div class="posts-list">
      <p v-if="posts.length === 0">Vous n'avez publié aucun post.</p>
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <img :src="post.author.avatar" alt="Avatar" class="avatar" />
          <span class="author-name">{{ post.author.displayName }}</span>
          <button @click="deletePost(post.id)" class="btn-delete-post">Supprimer</button>
        </div>
        <p class="post-content">{{ post.text }}</p>
        <div v-if="post.media && post.media.length" class="post-media">
          <video v-if="post.mediaType === 'video'" :src="post.media[0]" controls></video>
          <div v-else class="image-grid">
            <img v-for="(img, index) in post.media" :key="index" :src="img" alt="Post image" />
          </div>
        </div>
        <div class="post-actions">
          <span>❤️ {{ post.likesCount }}</span>
          <span>💬 {{ post.commentsCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const posts = ref<any[]>([]);

const fetchMyPosts = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/posts/me`);
    if (response.ok) {
      posts.value = await response.json();
    }
  } catch (error) {
  }
};

const deletePost = async (postId: number) => {
  if (!confirm("Voulez-vous vraiment supprimer ce post ?")) return;
  
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      posts.value = posts.value.filter(p => p.id !== postId);
    }
  } catch (error) {
  }
};

onMounted(fetchMyPosts);
</script>