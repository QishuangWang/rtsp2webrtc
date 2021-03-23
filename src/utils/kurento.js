import kurentoUtils from 'kurento-utils'
import kurentoClient from 'kurento-client'

class Kurento {
  constructor(wsUri, rtspUri, domId) {
    // this.options = {
    //   ws_uri: 'ws://192.168.1.155:8888/kurento',
    //   rtsp_uri: 'rtsp://freja.hiof.no:1935/rtplive/definst/hessdalen03.stream',
    //   ice_servers: {
    //     urls: 'turn:192.168.1.155:3478',
    //     username: 'kurento',
    //     credential: 'kurento'
    //   }
    // }
    this.wsUri = wsUri
    this.rtspUri = rtspUri
    this.videoDomId = domId
  }

  start() {
    const options = {
      remoteVideo: document.getElementById(this.videoDomId)
    }
    this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      (error) => {
        if (error) {
          return console.error(error)
        }
        this.webRtcPeer.generateOffer((error, sdpOffer) => {
          this._onOffer(error, sdpOffer)
        })
        this.webRtcPeer.peerConnection.addEventListener('iceconnectionstatechange', (event) => {
          if (this.webRtcPeer && this.webRtcPeer.peerConnection) {
            console.log('oniceconnectionstatechange -> ' + this.webRtcPeer.peerConnection.iceConnectionState)
            console.log('icegatheringstate -> ' + this.webRtcPeer.peerConnection.iceGatheringState)
          }
        })
      })
  }

  stop() {
    // address.disabled = false
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose()
      this.webRtcPeer = null
    }
    if (this.pipeline) {
      this.pipeline.release()
      this.pipeline = null
    }
    // hideSpinner(videoOutput)
  }

  _onOffer(error, sdpOffer) {
    console.log(error)
    if (error) return this._onError(error)
    kurentoClient(this.wsUri, (error, kurentoClient) => {
      if (error) return this._onError(error)
      kurentoClient.create('MediaPipeline', (error, p) => {
        this._createMediaPipeline(error, p, sdpOffer)
      })
    })
  }

  _createMediaPipeline(error, p, sdpOffer) {
    if (error) return this._onError(error)
    this.pipeline = p
    this.pipeline.create('PlayerEndpoint', { uri: this.rtspUri }, (error, player) => {
      if (error) return this._onError(error)
      this.pipeline.create('WebRtcEndpoint', (error, webRtcEndpoint) => {
        if (error) return this._onError(error)
        this.setIceCandidateCallbacks(webRtcEndpoint, this.webRtcPeer, this._onError)
        webRtcEndpoint.processOffer(sdpOffer, (error, sdpAnswer) => {
          if (error) return this._onError(error)
          webRtcEndpoint.gatherCandidates(this._onError)
          this.webRtcPeer.processAnswer(sdpAnswer)
        })
        player.connect(webRtcEndpoint, (error) => {
          if (error) return this._onError(error)
          console.log('PlayerEndpoint-->WebRtcEndpoint connection established')
          player.play((error) => {
            if (error) return this._onError(error)
            console.log('Player playing ...')
          })
        })
      })
    })
  }

  setIceCandidateCallbacks(webRtcEndpoint, webRtcPeer, onError) {
    webRtcPeer.on('icecandidate', (candidate) => {
      console.log('Local icecandidate ' + JSON.stringify(candidate))
      candidate = kurentoClient.register.complexTypes.IceCandidate(candidate)
      webRtcEndpoint.addIceCandidate(candidate, onError)
    })
    webRtcEndpoint.on('OnIceCandidate', (event) => {
      var candidate = event.candidate
      console.log('Remote icecandidate ' + JSON.stringify(candidate))
      webRtcPeer.addIceCandidate(candidate, onError)
    })
  }

  _onError(error) {
    if (error) {
      console.error(error)
      this.stop()
    }
  }
}

export default Kurento
