let perlin = {
    rand_vect: function(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
}
perlin.seed();

class Snowball {
	constructor(canvas, ctx) {
		this.canvas = canvas
		this.ctx = ctx

		this.minRadius = 2
		this.maxRadius = 5

		this.maxSpeedX = 1

		this.minSpeedY = 3
		this.maxSpeedY = 8

		this.reset()
		this.y = Math.floor(Math.random() * (canvas.width - this.radius))
	}
	reset() {
		this.radius = Math.floor(Math.random() * (this.maxRadius - this.minRadius)) + this.minRadius
		this.x = Math.floor(Math.random() * (this.canvas.width - this.radius))
		this.y = 0

		this.speedX = Math.floor(Math.random() * (this.maxSpeedX - (-this.maxSpeedX)) - this.maxSpeedX)
		this.speedY = Math.floor(Math.random() * (this.maxSpeedY - this.minSpeedY) + this.minSpeedY)
	}
	update() {
		this.x += this.speedX
		this.y += this.speedY

		if (this.x >= this.canvas.width || this.y >= this.canvas.height) {
			this.reset()
		}
	}
	draw() {
		this.ctx.beginPath()
		this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
		this.ctx.fill()
	}
}

class Snowy {
	constructor(amount = 10, buildUp = false, zIndex = 10, color = "white") {
		this.amount = amount
		this.buildUp = buildUp
		this.zIndex = zIndex
		this.color = color

		this.canvas = document.createElement("canvas")
		this.ctx = this.canvas.getContext("2d")

		document.body.style.overflowX = "hidden"
		document.body.append(this.canvas)

		this.canvas.style.position = "absolute"
		this.canvas.style.top = "0"
		this.canvas.style.left = "0"

		this.canvas.style.margin = "0"
		this.canvas.style.padding = "0"

		this.canvas.style.pointerEvents = "none"

		this.snowballs = []

		for (let i = 0; i < amount; i++) {
			this.snowballs.push(new Snowball(this.canvas, this.ctx))
		}

		this.buildUpHeight = 0
		this.buildUpNoise = this.createBuildUpNoise()
		this.buildUpSize = 100

		this.size()
		window.addEventListener("resize", () => {
			this.size()
		})
		
		requestAnimationFrame(() => {
			this.draw()
		})
	}
	map(in_min, in_max, out_min, out_max) {
		return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	}
	createBuildUpNoise() {
		const buildUpNoise = []
		for (let x = 0; x < window.innerWidth * 1.5; x++) {
			buildUpNoise.push((perlin.get(x / 70, 0) / 2) + 1)
		}
		return buildUpNoise
	}
	pageHeight() {
		return Math.max(document.body.offsetHeight, window.innerHeight)
	}
	size() {
		this.canvas.width = window.innerWidth
		this.canvas.height = this.pageHeight()
	}
	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		this.ctx.fillStyle = this.color

		if (!this.buildUp || this.buildUpHeight < this.pageHeight() + (this.buildUpSize * 2))
		for (let i = 0; i < this.amount; i++) {
			this.snowballs[i].update()
			this.snowballs[i].draw()
		}

		if (this.buildUpHeight < this.pageHeight() + (this.buildUpSize * 2)) {
			this.buildUpHeight += 0.05
		}

		if (this.buildUp) {
			this.ctx.beginPath()
			for (let x = 0; x < window.innerWidth; x++) {
				const offset = this.buildUpNoise[x] * (this.buildUpSize)
				const y = (this.pageHeight() - this.buildUpHeight) + offset

				if (x == 0) {
					this.ctx.moveTo(x, y)
				} else {
					this.ctx.lineTo(x, y)
				}
			}
			this.ctx.lineTo(window.innerWidth, this.pageHeight())
			this.ctx.lineTo(0, this.pageHeight())
			this.ctx.fill()
			/*
			this.ctx.fillRect(0, this.pageHeight() - this.buildUpHeight, window.innerWidth, this.buildUpHeight)
			*/
		}

		requestAnimationFrame(() => {
			this.draw()
		})
	}
}