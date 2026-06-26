<template>
  <div class="profile-container">
    <h2>Éditer le profil</h2>
    <div class="avatar-section">
      <img :src="previewAvatar || user.avatar" alt="Avatar" class="avatar-preview" />
      <input type="file" accept="image/*" @change="onAvatarSelected" ref="avatarInput" style="display: none" />
      <button @click="avatarInput?.click()" class="btn-change-avatar">Changer la photo</button>
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
  id: null,
  displayName: '',
  email: '',
  password: ' ',
  avatar: '/default-avatar.png'
});

const avatarFile = ref<File | null>(null);
const previewAvatar = ref<string | null>(null);
const isDarkMode = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);

const onAvatarSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0];
    previewAvatar.value = URL.createObjectURL(avatarFile.value);
  }
};

const saveProfile = async () => {
  if (!user.id) return;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));

  try {
    if (avatarFile.value) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        await fetch(`${apiUrl}/api/v0/users/me/profile_picture`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profile_picture_url: e.target?.result })
        });
      };
      reader.readAsDataURL(avatarFile.value);
    }

    const response = await fetch(`${apiUrl}/api/v0/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        User_DisplayName: user.displayName,
        User_mail: user.email,
        User_password: user.password
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      user.displayName = data.User_DisplayName;
    }
  } catch (error) {
  }
};

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
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    await fetch(`${apiUrl}/api/v0/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
  }
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  router.push('/');
};

onMounted(async () => {
  isDarkMode.value = document.body.classList.contains('dark-mode');
  
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    const response = await fetch(`${apiUrl}/api/v0/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      user.id = data.User_ID;
      user.displayName = data.User_DisplayName;
      user.email = data.User_mail;
      if (data.profile_picture_url) {
        user.avatar = data.profile_picture_url;
      }
    }
  } catch (error) {
  }
});
</script>