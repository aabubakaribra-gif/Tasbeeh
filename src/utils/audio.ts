class AudioSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick(type: 'mechanical' | 'ambient' | 'peaceful', volume: number = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(volume, now);
      mainGain.connect(this.ctx.destination);

      if (type === 'mechanical') {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
        
        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start(now);
        osc.stop(now + 0.05);

        // Add a tiny noise burst for a crisp mechanical spring click
        const bufferSize = this.ctx.sampleRate * 0.01; // 10ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(4000, now);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(mainGain);
        noiseSource.start(now);
        noiseSource.stop(now + 0.015);

      } else if (type === 'ambient') {
        // Soft wooden marble / organic stick tap
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        
        oscGain.gain.setValueAtTime(0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start(now);
        osc.stop(now + 0.07);

      } else if (type === 'peaceful') {
        // Soft meditative water ripple or gentle chime
        const length = 0.15;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        const gain2 = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.linearRampToValueAtTime(530, now + length);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, now); // G5 (Overtones)
        
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + length);
        
        gain2.gain.setValueAtTime(0.15, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + length);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(mainGain);
        gain2.connect(mainGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + length);
        osc2.stop(now + length);
      }
    } catch (e) {
      console.warn("Failed to synthesizer tick sound:", e);
    }
  }

  playCompletionChime(volume: number = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(volume * 0.8, now);
      mainGain.connect(this.ctx.destination);

      // Create a gorgeous singing bowl chord (Pentatonic Root, Third, Fifth, Octave, and beautiful overtones)
      const freqs = [329.63, 440.0, 523.25, 659.25, 880.0]; // Elegant chord (A minor pentatonic: E4, A4, C5, E5, A5)
      const decay = 1.8;

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slightly detune to create peaceful vibrato/beating
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

        const initialVol = (0.3 / freqs.length) * (idx === 0 ? 1.5 : 1);
        gain.gain.setValueAtTime(initialVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

        osc.connect(gain);
        gain.connect(mainGain);
        
        osc.start(now);
        osc.stop(now + decay + 0.1);
      });
    } catch (e) {
      console.warn("Failed to generate completion chime:", e);
    }
  }

  playNotificationChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(0.4, now);
      mainGain.connect(this.ctx.destination);

      // Friendly notification melody: A5 -> C6 -> E6
      const scheduleMelody = (freq: number, startTime: number, duration: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(mainGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      scheduleMelody(880.00, now, 0.4);       // A5
      scheduleMelody(1046.50, now + 0.15, 0.4); // C6
      scheduleMelody(1318.51, now + 0.3, 0.6);  // E6
    } catch (e) {
      console.warn("Error playing Notification chime:", e);
    }
  }
}

export const audioSynth = new AudioSynth();
