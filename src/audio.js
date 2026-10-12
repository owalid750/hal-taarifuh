// صوت هادئ لنسيم الصحراء يُولَّد محلياً عبر Web Audio API
class AmbientAudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.noiseNode = null;
    this.filterNode = null;
    this.gainNode = null;
    this.isMuted = true;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(260, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(3, this.ctx.currentTime);
    this.filterNode.connect(this.gainNode);

    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.filterNode);
    this.noiseNode.start();
  }

  modulateWind() {
    if (!this.filterNode || !this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const frequency = 180 + Math.random() * 200;
    const duration = 3 + Math.random() * 4;
    this.filterNode.frequency.linearRampToValueAtTime(frequency, now + duration);
    window.setTimeout(() => this.modulateWind(), duration * 1000);
  }

  toggle() {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.gainNode) return false;

    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.gainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      this.isPlaying = false;
    } else {
      this.isPlaying = true;
      this.gainNode.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.2);
      this.modulateWind();
    }

    return !this.isMuted;
  }
}

export const ambientAudio = new AmbientAudioManager();
