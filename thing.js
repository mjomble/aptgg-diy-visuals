"use strict";

(function(global) {
	var start = 0
	global.now = function now() {
		return (+new Date()) * 0.001 - start
	}
	start = now()
})(window || global || {})

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")

// set canvas size to the correct size
var screenWidth = 0
var screenHeight = 0
window.onresize = function(e) {
	screenWidth = window.innerWidth
	screenHeight = window.innerHeight

	canvas.width = screenWidth
	canvas.height = screenHeight
};
window.onresize()

const d90 = Math.PI * 0.5
const size = 8
const halfSize = size / 2

// Quick and dirty deterministic pseudorandom
const newSeed = (seed) => seed * 16807 % 2147483647
const rand = (seed) => 0.2 + Math.abs(seed / 2147483647) * 0.6

const grid = (level, time, start, r, seed, sx, sy) => {
	level--

	if (level < 0 || Math.abs(sx) < size * 3 || Math.abs(sy) < size * 3) {
		return
	}

	const speed = Math.max(100, (level - 7) * 50)
	const duration = Math.abs(sy) / speed
	const yPos = (time - start) / duration

	const s1 = newSeed(seed)
	const s2 = newSeed(s1)

	if (yPos > 0) {
		if (yPos < 1) {
			context.save()
			context.translate(r, yPos)
			context.scale(1 / sx, 1 / sy)
			context.fillStyle = 'white'
			context.fillRect(-halfSize, -halfSize, size, size)
			context.restore()
		}

		{
			context.save()
			context.translate(r, 0)
			context.rotate(d90)
			const nx = 1, ny = r
			context.scale(nx, ny)
			const r1 = rand(s1)
			grid(level, time, start + duration * r1, r1, s1, sy * nx, sx * ny)
			context.restore()
		}

		{
			context.save()
			context.translate(r, 0)
			context.rotate(-d90)
			const nx = -1, ny = 1 - r
			context.scale(nx, ny)
			const r2 = rand(s2)
			grid(level, time, start + duration * r2, r2, s2, sy * nx, sx * ny)
			context.restore()
		}
	}
}

const firstSeed = newSeed(newSeed(new Date()))

function update(deltaTime) {
  context.fillStyle = 'rgba(0, 0, 0, 0.02)'
	context.fillRect(0, 0, screenWidth, screenHeight)

	context.save()
  const r = rand(firstSeed)
	const sx = screenWidth, sy = screenHeight
	context.scale(sx, sy)
	grid(14, now(), 0, r, firstSeed, sx, sy)
	context.restore()
}

var lastTime = 0

function tick() {
	requestAnimationFrame(tick)
	var currentTime = now()
	update(currentTime - lastTime)
	lastTime = currentTime
}

tick()

context.fillStyle = 'black'
context.fillRect(0, 0, screenWidth, screenHeight)
