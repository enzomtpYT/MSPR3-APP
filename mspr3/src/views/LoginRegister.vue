<template>
  <div class="auth-container">
    <div class="header">
      <h1>{{ isLogin ? 'Connexion' : 'Inscription' }}</h1>
    </div>

    <div v-if="errorMessage" class="error-alert" style="color: red; margin-bottom: 1rem; padding: 0.5rem; background: #fee; border-radius: 4px;">
      {{ errorMessage }}
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
      <div v-if="isLogin" class="form-group checkbox-group">
        <input v-model="form.rememberMe" type="checkbox" id="rememberMe" />
        <label for="rememberMe" style="font-size: 14px; cursor: pointer;">Se souvenir de moi</label>
      </div>
      <button type="submit" class="btn-primary">
        {{ isLogin ? 'Se connecter' : 'Créer un compte' }}
      </button>
    </form>
    
    <p class="toggle-mode" @click="toggleMode" style="cursor: pointer; color: blue; text-decoration: underline; margin-top: 1rem;">
      {{ isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter" }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogin = ref(true);
const errorMessage = ref('');

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  rememberMe: false
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  form.password = ''; 
};

const handleSubmit = async () => {
  errorMessage.value = '';

  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    const endpoint = isLogin.value ? '/api/v0/auth/login' : '/api/v0/auth/register';
    
    let bodyPayload;
    let headers: Record<string, string> = {};

    if (isLogin.value) {
      bodyPayload = new URLSearchParams();
      bodyPayload.append('username', form.email);
      bodyPayload.append('password', form.password);
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      bodyPayload = JSON.stringify({ 
        email: form.email, 
        password: form.password, 
        displayName: form.displayName 
      });
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: bodyPayload
    });

    if (response.ok) {
      const data = await response.json();
      if (isLogin.value) {
        if (form.rememberMe) {
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }
        router.push('/feed');
      } else {
        isLogin.value = true;
        errorMessage.value = "Compte créé avec succès ! Veuillez vous connecter.";
      }
    } else {
      const errorData = await response.json();
      
      if (errorData && errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage.value = errorData.detail; 
        } else if (Array.isArray(errorData.detail)) {
          errorMessage.value = "Erreur de validation des données.";
        }
      } else {
        errorMessage.value = "Une erreur inattendue est survenue.";
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
    errorMessage.value = "Impossible de se connecter au serveur. Vérifiez votre connexion ou l'URL de l'API.";
  }
};
</script>