<template>
	<div class="p-10">about</div>
</template>

<script setup lang="ts" name="About">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
console.log("route", route);
console.log("router", router);
</script>
