class Snowball {
	constructor(canvas, ctx) {
		this.canvas = canvas
		this.ctx = ctx

		this.minRadius = 3
		this.maxRadius = 8

		this.maxSpeedX = 1

		this.minSpeedY = 3
		this.maxSpeedY = 8

		this.reset()
		this.y = Math.floor(Math.random() * (canvas.width - this.radius))

		this.color = "white"
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
		this.ctx.fillStyle = this.color
		
		this.ctx.beginPath()
		this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
		this.ctx.fill()
	}
}

class Snowy {
	constructor(amount, buildUp, zIndex) {
		this.amount = amount
		this.buildUp = buildUp
		this.zIndex = zIndex

		this.canvas = document.createElement("canvas")
		this.ctx = this.canvas.getContext("2d")

		document.body.style.overflowX = "hidden"
		document.body.append(this.canvas)

		this.canvas.style.position = "absolute"
		this.canvas.style.top = "0"
		this.canvas.style.left = "0"
		this.canvas.style.overflow = "hidden"
		this.canvas.style.pointerEvents = "none"

		this.snowballs = []

		for (let i = 0; i < amount; i++) {
			this.snowballs.push(new Snowball(this.canvas, this.ctx))
		}

		this.size()
		window.addEventListener("resize", () => {
			this.size()
		})
		
		requestAnimationFrame(() => {
			this.draw()
		})
	}
	size() {
		this.canvas.width = window.innerWidth
		this.canvas.height = Math.max(document.body.clientHeight, window.innerHeight)
	}
	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		for (let i = 0; i < this.amount; i++) {
			this.snowballs[i].update()
			this.snowballs[i].draw()
		}

		requestAnimationFrame(() => {
			this.draw()
		})
	}
}