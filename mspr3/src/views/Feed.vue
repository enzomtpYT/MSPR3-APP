<template>
  <div class="feed-container">
    <div class="feed-header">
      <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Rechercher..." class="search-bar" />
      <div class="sort-options">
        <select v-model="sortBy" @change="fetchPosts">
          <option value="date">Plus récents</option>
          <option value="likes">All Time High</option>
          <option value="hot">Populaire</option>
        </select>
      </div>
    </div>
    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <img :src="post.author.avatar" alt="Avatar" class="avatar" />
          <span class="author-name">{{ post.author.displayName }}</span>
        </div>
        <p class="post-content">{{ post.text }}</p>
        <div v-if="post.media && post.media.length" class="post-media">
          <video v-if="post.mediaType === 'video'" :src="post.media[0]" controls></video>
          <div v-else class="image-grid">
            <img v-for="(img, index) in post.media" :key="index" :src="img" alt="Post image" />
          </div>
        </div>
        <div class="post-actions">
          <button @click="likePost(post.id)" :class="{ liked: post.isLiked }">
            ❤️ {{ post.likesCount }}
          </button>
          <button @click="toggleComments(post.id)">
            💬 {{ post.commentsCount }}
          </button>
        </div>

        <div v-if="post.showComments" class="comments-section">
          <div class="comments-list">
            <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
              <img :src="comment.author.avatar" class="comment-avatar" />
              <div class="comment-body">
                <strong>{{ comment.author.displayName }}</strong>
                <p>{{ comment.text }}</p>
              </div>
            </div>
            <p v-if="post.comments.length === 0" style="font-size: 13px; color: var(--nav-text);">Soyez le premier à commenter !</p>
          </div>
          <div class="add-comment">
            <input 
              v-model="post.newComment" 
              type="text" 
              placeholder="Ajouter un commentaire..." 
              @keyup.enter="submitComment(post)" 
            />
            <button @click="submitComment(post)" :disabled="!post.newComment.trim()">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const searchQuery = ref('');
const sortBy = ref('date');
const posts = ref<any[]>([]); 

const fetchPosts = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/posts?sort=${sortBy.value}&search=${searchQuery.value}`);
    if (response.ok) {
      const data = await response.json();
      // On initialise les propriétés liées aux commentaires pour chaque post
      posts.value = data.map((p: any) => ({
        ...p,
        showComments: false,
        comments: [],
        newComment: ''
      }));
    }
  } catch (error) {
  }
};

const handleSearch = () => {
  fetchPosts();
};

const likePost = async (postId: number) => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
      method: 'POST'
    });
    if (response.ok) {
      const data = await response.json();
      const postIndex = posts.value.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        posts.value[postIndex].isLiked = data.isLiked;
        posts.value[postIndex].likesCount = data.likesCount;
      }
    }
  } catch (error) {
  }
};

const toggleComments = async (postId: number) => {
  const post = posts.value.find(p => p.id === postId);
  if (!post) return;

  post.showComments = !post.showComments;

  // Récupère les commentaires la première fois qu'on ouvre la section
  if (post.showComments && post.comments.length === 0 && post.commentsCount > 0) {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`);
      if (response.ok) {
        post.comments = await response.json();
      }
    } catch (error) {
    }
  }
};

const submitComment = async (post: any) => {
  if (!post.newComment.trim()) return;

  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: post.newComment })
    });

    if (response.ok) {
      const addedComment = await response.json();
      post.comments.push(addedComment);
      post.commentsCount = addedComment.commentsCount;
      post.newComment = ''; // Vide l'input
    }
  } catch (error) {
  }
};

onMounted(fetchPosts);
</script>