<template>
  <div 
    class="feed-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div 
      class="ptr-indicator" 
      :style="{ height: pullDistance + 'px', transition: isPulling ? 'none' : 'height 0.3s ease' }"
    >
      <div class="ptr-content" :style="{ opacity: pullDistance / 60 }">
        <span v-if="isRefreshing">↻ Chargement...</span>
        <span v-else-if="pullDistance >= 60">↓ Relâcher pour rafraîchir</span>
        <span v-else-if="pullDistance > 0">↓ Tirer pour rafraîchir</span>
      </div>
    </div>
    
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
          <img :src="post.author?.avatar ? getMediaUrl(post.author.avatar) : '/default-avatar.png'" alt="Avatar" class="avatar" />
          <div style="display: flex; flex-direction: column;">
            <span class="author-name">{{ post.author?.displayName }}</span>
            <span style="font-size: 0.8em; color: gray;">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
        <p class="post-content">{{ post.text }}</p>
        
        <div v-if="post.mediaList && post.mediaList.length > 0" class="post-media">
          <video v-if="post.mediaType === 'video'" :src="getMediaUrl(post.mediaList[0])" controls></video>
          <div v-else class="image-grid">
            <img v-for="(img, index) in post.mediaList" :key="index" :src="getMediaUrl(img)" alt="Post image" />
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
              <img :src="comment.author?.avatar ? getMediaUrl(comment.author.avatar) : '/default-avatar.png'" class="comment-avatar" />
              <div class="comment-body" style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <strong>{{ comment.author?.displayName }}</strong>
                    <span style="font-size: 0.75em; color: gray; margin-left: 8px;">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <button v-if="comment.author?.User_ID === currentUserId" @click="deleteComment(post.id, comment.id)" style="color: var(--danger-color, red); background: none; border: none; cursor: pointer; padding: 0 5px;">✕</button>
                </div>
                <p style="margin: 4px 0 0 0;">{{ comment.text }}</p>
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
const currentUserId = ref<number | null>(null);

// Pull to Refresh State
const isPulling = ref(false);
const pullDistance = ref(0);
const startY = ref(0);
const isRefreshing = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  const mainContent = document.querySelector('.main-content');
  if (mainContent && mainContent.scrollTop === 0) {
    startY.value = e.touches[0].clientY;
    isPulling.value = true;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isPulling.value || isRefreshing.value) return;
  const currentY = e.touches[0].clientY;
  const distance = currentY - startY.value;
  
  if (distance > 0) {
    pullDistance.value = Math.min(distance * 0.4, 80);
    if (e.cancelable && distance > 10) e.preventDefault();
  } else {
    isPulling.value = false;
  }
};

const handleTouchEnd = async () => {
  if (!isPulling.value) return;
  isPulling.value = false;
  
  if (pullDistance.value >= 60) {
    isRefreshing.value = true;
    pullDistance.value = 50;
    await fetchPosts();
    isRefreshing.value = false;
  }
  pullDistance.value = 0;
};

const getMediaUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  // Ajout de l'URL de votre serveur en fallback explicite
  const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ;
  const formattedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${apiUrl}${formattedUrl}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const fetchPosts = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ;
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    const searchParam = searchQuery.value ? `&search=${encodeURIComponent(searchQuery.value)}` : '';
    
    const response = await fetch(`${apiUrl}/api/v0/posts/?sort=${sortBy.value}${searchParam}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      posts.value = data.map((p: any) => {
        // CORRECTION ICI: On s'assure que mediaList est un vrai tableau
        let parsedMedia = [];
        if (Array.isArray(p.media)) {
          parsedMedia = p.media;
        } else if (typeof p.media === 'string') {
          try {
            // Si la BDD a retourné "['/static/...']", on le transforme en vrai JSON
            parsedMedia = JSON.parse(p.media.replace(/'/g, '"'));
          } catch (e) {
            parsedMedia = [p.media];
          }
        }

        return {
          ...p,
          mediaList: parsedMedia, // On utilise cette variable sécurisée
          showComments: false,
          comments: [],
          newComment: ''
        };
      });
    }
  } catch (error) {
    console.error("Erreur fetchPosts :", error);
  }
};

const handleSearch = () => {
  fetchPosts();
};

const likePost = async (postId: number) => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ;
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    const response = await fetch(`${apiUrl}/api/v0/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
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

  if (post.showComments && post.comments.length === 0 && post.commentsCount > 0) {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      const response = await fetch(`${apiUrl}/api/v0/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    const response = await fetch(`${apiUrl}/api/v0/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text: post.newComment })
    });

    if (response.ok) {
      const addedComment = await response.json();
      post.comments.push({
        ...addedComment,
        text: addedComment.text || addedComment.content,
        author: addedComment.author || addedComment.user
      });
      post.commentsCount = addedComment.commentsCount || (post.commentsCount + 1);
      post.newComment = ''; 
    }
  } catch (error) {
  }
};

const deleteComment = async (postId: number, commentId: number) => {
  if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
  
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    const response = await fetch(`${apiUrl}/api/v0/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        post.comments = post.comments.filter((c: any) => c.id !== commentId);
        post.commentsCount--;
      }
    }
  } catch (error) {
  }
};

onMounted(() => {
  const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId.value = parseInt(payload.sub);
    } catch (e) {
    }
  }
  fetchPosts();
});
</script>