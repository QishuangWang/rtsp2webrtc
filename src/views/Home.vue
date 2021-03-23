<template>
  <div class="home">
    <template v-for="(uri,index) in rtspUris">
      <rtsp-player class="rtsp-player" :key="index" :domKey="index" :wsUri="wsUri" :rtspUri="uri"></rtsp-player>
    </template>
  </div>
</template>

<script>
import RtspPlayer from '@/components/RtspPlayer'

export default {
  components: {
    RtspPlayer
  },
  data() {
    return {
      rtspUris: [
        'rtmp://58.200.131.2:1935/livetv/hunantv',
        'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
        'rtsp://freja.hiof.no:1935/rtplive/definst/hessdalen03.stream',
        'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_175k.mov'
      ],
      wsUri: 'ws://192.168.1.155:8888/kurento'
    }
  }
}
</script>

<style lang="scss" scoped>
.rtsp-player {
  width: 200px;
  height: 100px;
}
</style>
