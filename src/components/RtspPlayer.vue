<template>
  <video class="player" :id="'video_'+domKey" autoplay muted></video>
</template>

<script>
import Kurento from '@/utils/kurento'

export default {
  name: 'rtsp-player',
  props: {
    domKey: {
      type: String,
      required: true
    },
    wsUri: {
      type: String,
      required: true
    },
    rtspUri: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      kurento: null
    }
  },
  mounted() {
    this.kurento = new Kurento(this.wsUri, this.rtspUri, 'video_' + this.domKey)
    this.kurento.start()
  },

  beforeDestroy() {
    this.kurento.stop()
  }
}
</script>

<style lang="scss" scoped>
.player {
  background-color: black;
  margin-left: 5px;
  :first-child {
    margin-left: 0;
  }
}
</style>
