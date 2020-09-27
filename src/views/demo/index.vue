<template>
  <div class="demo">
    <van-tabs
      v-model="active"
      color="#4EB4FF"
      line-width="60px"
      title-active-color="#4EB4FF"
      sticky
      :swipe-threshold="3"
    >
      <van-tab title="菜单一" />
      <van-tab title="菜单二" />
      <van-tab title="菜单三" />
      <div class="pt10"></div>

      <xmcard-render
        v-for="item in mock"
        :key="item"
        :name="item"
      />
    </van-tabs>
  </div>
</template>

<script>
import deps from '@/deps/demo'

export default {
  components: {
  },

  data () {
    return {
      active: 0
    }
  },

  computed: {
    mock () {
      return deps[this.active]
    }
  }
}
</script>
