<template>
  <div class="hello" id="charge">
    <van-button @click="stop">
      停止
    </van-button>
    <van-button @click="start">
      开始
    </van-button>
  </div>
</template>
<script>
// import
export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "",
      ctx: "",
      w: null,
      h: null,
      cx: null,
      cy: null,
      PI: null,
      PI_HALF: null,
      cos: null,
      sin: null,
      random: null,
      lineWidth: null,
      C: null,
      rings: null,
      ringsLength: null,
      canvasData: null,
      animation:null,
    };
  },
  mounted() {
    console.log("object");
    this.init();
  },
  methods: {
    loop() {
      this.draw();
      this.animation= window.requestAnimationFrame(this.loop);
      
    },
    stop(){
      console.log("78888");
      window.cancelAnimationFrame(this.animation);
    },
    start(){
      this.loop();
    },
    init() {
      this.ctx = document.createElement("canvas").getContext("2d");
      this.w = 600;
      this.h = 600;
      this.cx = this.w / 2;
      this.cy = this.h / 2;
      this.rings = [];
      this.ringsLength = 0;

      this.PI = Math.PI;
      this.PI_HALF = this.PI / 2;
      this.cos = Math.cos;
      this.sin = Math.sin;
      this.random = Math.random;

      this.lineWidth = 0.2;
      this.C = [
        "#ABF8FF",
        "#E76B76",
        "#1D2439",
        "#4F3762",
        "#67F9FF",
        "#0C0F18",
      ];
      this.canvasData = [
        /* ring {t:total_particles, r:radius, d:distance, s:speed, c:color} */
        [
          { t: 80, r: this.cx - 10, d: 40, s: 30, c: this.C[1] },
          { t: 60, r: this.cx - 20, d: 40, s: 80, c: this.C[2] },
          { t: 20, r: this.cx - 30, d: 20, s: 80, c: this.C[2] },
        ],
        [
          { t: 80, r: this.cx - 80, d: 40, s: 40, c: this.C[4] },
          { t: 80, r: this.cx - 90, d: 20, s: 40, c: this.C[4] },
          { t: 20, r: this.cx - 100, d: 20, s: 40, c: this.C[2] },
          { t: 40, r: this.cx - 110, d: 20, s: 40, c: this.C[2] },
        ],
        [
          { t: 60, r: this.cx - 160, d: 40, s: 20, c: this.C[2] },
          { t: 20, r: this.cx - 170, d: 30, s: 60, c: this.C[2] },
          { t: 40, r: this.cx - 180, d: 40, s: 60, c: this.C[2] },
        ],
        [
          { t: 40, r: this.cx - 230, d: 40, s: 20, c: this.C[5] },
          { t: 20, r: this.cx - 240, d: 20, s: 10, c: this.C[5] },
        ],
        [{ t: 10, r: this.cx - 290, d: 10, s: 10, c: this.C[4] }],
      ];

      /* */
      this.ctx.canvas.width = this.w;
      this.ctx.canvas.height = this.h;
      document.getElementById("charge").appendChild(this.ctx.canvas);
      this.canvasData.forEach((group) => {
        var ring = [];
        group.forEach((orbit, i) => {
          var total_particles, index;

          total_particles = orbit.t;
          index = 0;

          for (; index < total_particles; index++) {
            var radius, distance, speed, color, opacity;

            radius = orbit.r;
            distance = orbit.d;
            speed = Math.random() / orbit.s;
            speed = i % 2 ? speed : speed * -1;
            color = orbit.c;
            opacity = orbit.o;
            ring.push(this.P(radius, distance, speed, color, opacity));
            radius = distance = speed = color = opacity = null;
          }
        });

        this.rings.push(ring);
      });
      console.log(this.ctx);
      console.log(this.canvasData);
      console.log(this.rings);
      this.ringsLength = this.rings.length;
      this.draw();
    },
    P(radius, distance, speed, color) {
      let obj = {};
      obj.a = this.PI / 180;
      obj.d = distance;
      obj.d2 = obj.d * obj.d;
      obj.x = this.cx + radius * Math.cos(obj.a);
      obj.y = this.cy + radius * Math.sin(obj.a);
      obj.c = color;
      obj.r = Math.random() * 8;
      obj.R = Math.random() > 0.5 ? radius : radius - 5;
      obj.s = speed;
      obj.pos = Math.random() * 360;
      return obj;
    },
    draw() {
      var i, j, k, xd, yd, d, ring, ringLength, ringLength2, particle, p2;
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.rect(0, 0, this.w, this.h);
      this.ctx.fillStyle = "#151a28";
      this.ctx.fill();
      this.ctx.closePath();

      for (i = 0; i < this.ringsLength; i++) {
        ring = this.rings[i];
        ringLength = ring.length;
        ringLength2 = ringLength - 100;

        for (j = 0; j < ringLength; j++) {
          particle = ring[j];

          particle.x =
            this.cx + particle.R * Math.sin(this.PI_HALF + particle.pos);
          particle.y =
            this.cy + particle.R * Math.cos(this.PI_HALF + particle.pos);
          particle.pos += particle.s;

          this.ctx.beginPath();
          this.ctx.globalAlpha = 0.12;
          this.ctx.globalCompositeOperation = "lighter";
          this.ctx.fillStyle = particle.c;
          this.ctx.arc(particle.x, particle.y, particle.r, this.PI * 2, false);
          this.ctx.fill();
          this.ctx.closePath();

          for (k = 0; k < ringLength2; k++) {
            p2 = ring[k];

            yd = p2.y - particle.y;
            xd = p2.x - particle.x;
            d = xd * xd + yd * yd;

            if (d < particle.d2) {
              this.ctx.beginPath();
              this.ctx.globalAlpha = 1;
              this.ctx.lineWidth = this.lineWidth;
              this.ctx.moveTo(particle.x, particle.y);
              this.ctx.lineTo(p2.x, p2.y);
              this.ctx.strokeStyle = p2.c;
              this.ctx.stroke();
              this.ctx.closePath();
            }
          }
        }
      }
    },
  },
};
</script>
<style lang="less" scoped>
</style>
