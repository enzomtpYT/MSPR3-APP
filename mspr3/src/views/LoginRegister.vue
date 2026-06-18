<template>
  <div class="auth-container">
    <div class="header">
      <h1>{{ isLogin ? 'Connexion' : 'Inscription' }}</h1>
    </div>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div v-if="!isLogin" class="form-group">
        <label>Nom d'affichage</label>
        <input v-model="form.displayName" type="text" placeholder="Votre pseudo" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="email@exemple.com" required />
      </div>
      <div class="form-group">
        <label>Mot de passe</label>
        <input v-model="form.password" type="password" placeholder="********" required />
      </div>
      <button type="submit" class="btn-primary">
        {{ isLogin ? 'Se connecter' : 'Créer un compte' }}
      </button>
    </form>
    <p class="toggle-mode" @click="isLogin = !isLogin">
      {{ isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter" }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogin = ref(true);
const form = reactive({
  displayName: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register';
    
    const payload = isLogin.value 
      ? { email: form.email, password: form.password }
      : { displayName: form.displayName, email: form.email, password: form.password };

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      router.push('/feed');
    }
  } catch (error) {
  }
};
</script>