<template>
  <div class="vpi-w-full vpi-h-full vpi-p-16">
    <div class="vpi-p-4 vpi-shadow-md vpi-max-w-md">
      <label for="#phone">
        <div class="vpi-py-2 vpi-text-gray-600">Your phone number :</div>
        <vue3-phone-input
          placeholder="Insert phone number"
          v-model="phone"
          raised
          id="phone"
        >
        </vue3-phone-input>
      </label>

      <div class="vpi-max-w-md vpi-py-8">
        <code class="vpi-whitespace-pre-line">
          {{ phone }}
        </code>
      </div>
      <button
        class="vpi-text-white vpi-rounded vpi-px-4 vpi-py-2 vpi-bg-purple-700"
        v-on:Click="filldata"
      >
        Fill Data
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Vue3PhoneInput from "./components/Vue3PhoneInput";

export default defineComponent({
  name: "app",
  components: {
    Vue3PhoneInput
  },
  data() {
    return {
      status: "",
      phone: {
        number: "",
        nationalNumber: "",
        isValid: false,
        callingCode: ""
      }
    };
  },

  methods: {
    filldata() {
      this.phone = {
        number: "+9312345678",
        nationalNumber: "12345678",
        isValid: true,
        callingCode: "93"
      };
    }
  }
});
</script>
