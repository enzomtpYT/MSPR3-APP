<template>
  <div class="create-container">
    <div class="header">
      <h2>Nouveau Post</h2>
      <button :disabled="!isValid" @click="publishPost" class="btn-publish">Publier</button>
    </div>
    <textarea 
      v-model="content" 
      placeholder="Quoi de neuf ?" 
      rows="5" 
      maxlength="280">
    </textarea>
    <div class="char-counter" :class="{ 'text-red': content.length >= 280 }">
      {{ content.length }} / 280
    </div>
    <div class="media-upload">
      <input 
        type="file" 
        accept="image/*,video/*" 
        multiple 
        @change="handleFileUpload" 
        ref="fileInput" 
        style="display: none;" 
      />
      <button @click="$refs.fileInput.click()" class="btn-media">
        Ajouter Média (Vidéo ou max 4 images)
      </button>
    </div>
    <div v-if="files.length > 0" class="preview-area">
      <p>{{ files.length }} fichier(s) sélectionné(s)</p>
      <button @click="files = []" class="btn-clear">Supprimer</button>
    </div>
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const content = ref('');
const files = ref<File[]>([]);
const errorMsg = ref('');
const router = useRouter();

const isValid = computed(() => {
  return content.value.trim().length > 0 || files.value.length > 0;
});

const handleFileUpload = (event: Event) => {
  errorMsg.value = '';
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const selectedFiles = Array.from(target.files);
  const hasVideo = selectedFiles.some(f => f.type.startsWith('video/'));

  if (hasVideo && selectedFiles.length > 1) {
    errorMsg.value = "Vous ne pouvez ajouter qu'une seule vidéo.";
    files.value = [];
    return;
  }
  if (!hasVideo && selectedFiles.length > 4) {
    errorMsg.value = "Vous pouvez ajouter un maximum de 4 images.";
    files.value = [];
    return;
  }
  files.value = selectedFiles;
};

const publishPost = async () => {
  try {
    const formData = new FormData();
    formData.append('content', content.value);
    
    let mediaType = 'none';
    if (files.value.length > 0) {
      mediaType = files.value[0].type.startsWith('video/') ? 'video' : 'image';
      files.value.forEach((file) => {
        formData.append('media', file);
      });
    }
    formData.append('mediaType', mediaType);

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${apiUrl}/api/v0/posts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      router.push('/feed');
    } else {
      errorMsg.value = "Erreur lors de la publication.";
    }
  } catch (error) {
    errorMsg.value = "Erreur de réseau.";
  }
};
</script>