<template>
    <div>
      <div
        class="flex gap-2 py-2 mt-4 rounded-lg shadow-md bg-amber-100/80 dark:bg-amber-950/80"
        v-if="quoteInfo.string"
      >
        <span class="self-start text-2xl">“</span>
        <div class="flex-1 my-4 indent-4">
          <h4>{{ quoteInfo.string }}</h4>
          <p v-if="quoteInfo.from" class="text-right">—— 《{{ quoteInfo.from }}》</p>
        </div>
        <span class="self-end text-2xl">”</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, reactive } from "vue";
  
  // 随机一言
  const quoteInfo = reactive({
    string: "什么都无法舍去的人，什么都不能改变",
    from: "进击的巨人",
  });
  
  onMounted(async () => {
    fetch("https://v1.hitokoto.cn?c=a&c=b&c=d&c=i&min_length=10")
      .then((response) => response.json())
      .then(({ hitokoto, from }) => {
        quoteInfo.string = hitokoto;
        quoteInfo.from = from;
      })
      .catch(console.error);
  });
  </script>