<template>
  <div class="profile-container">
    <h2>Éditer le profil</h2>
    <div class="avatar-section">
      <img :src="previewAvatar || user.avatar" alt="Avatar" class="avatar-preview" />
      <input type="file" accept="image/*" @change="onAvatarSelected" ref="avatarInput" style="display: none" />
      <button @click="$refs.avatarInput.click()" class="btn-change-avatar">Changer la photo</button>
    </div>
    <div class="form-group">
      <label>Nom d'affichage</label>
      <input v-model="user.displayName" type="text" placeholder="Nouveau pseudo" />
    </div>
    <div class="form-group theme-toggle-section">
      <label>Mode Sombre</label>
      <label class="switch">
        <input type="checkbox" :checked="isDarkMode" @change="toggleDarkMode" />
        <span class="slider round"></span>
      </label>
    </div>
    <button @click="saveProfile" class="btn-save">Enregistrer les modifications</button>
    <button @click="logout" class="btn-save" style="background-color: var(--danger-color); margin-top: 10px;">Se déconnecter</button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const user = reactive({
  displayName: '',
  avatar: '/default-avatar.png'
});

const avatarFile = ref<File | null>(null);
const previewAvatar = ref<string | null>(null);

const onAvatarSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0];
    previewAvatar.value = URL.createObjectURL(avatarFile.value);
  }
};

const saveProfile = async () => {
  const formData = new FormData();
  formData.append('displayName', user.displayName);
  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value);
  }

  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/profile`, {
      method: 'PUT',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      user.displayName = data.displayName;
      user.avatar = data.avatar;
    }
  } catch (error) {
  }
};

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
};

const logout = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST'
    });
  } catch (error) {
  }
  localStorage.removeItem('token');
  router.push('/');
};

onMounted(async () => {
  isDarkMode.value = document.body.classList.contains('dark-mode');
  
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiUrl}/api/profile`);
    if (response.ok) {
      const data = await response.json();
      user.displayName = data.displayName;
      user.avatar = data.avatar;
    }
  } catch (error) {
  }
});
</script>