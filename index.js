
let canvas, ctx;

const triangleCount = 30
const angleRad = Math.PI * 2 / triangleCount

const altTriangleCount = 40;
const altAngleRad = Math.PI * 2 / altTriangleCount

const rotationAngle = Math.PI * 2 / 360

let screenRadius = 1;
let longestEdge = 0;
let fadeCircleGradient;

const triangleRayColors = [
  'rgb(240, 120, 20)',//'#FF6B49',
  'rgb(240, 150, 20)', //'#BF5037', // 'yellow' //'#BF5037'
  '#E8D20C' // 'rgba(255,250,128,1)'
]

const triangle = (i, tick, alt) => {
  if (alt && i%2 === 0) return
  const angle = alt ? altAngleRad : angleRad
  const color = alt ? 'rgb(255, 255, 0)' : triangleRayColors[i % 3]
  ctx.save()
  
  if (alt) {
    // ctx.translate(5, 5)
    ctx.rotate(rotationAngle * tick/4 / 40)
  } else {
    ctx.rotate(rotationAngle * tick / 40)
  }
  ctx.beginPath();
  ctx.lineWidth = 1
  ctx.strokeStyle = color
  ctx.fillStyle = color
  // ctx.translate(tick, 0)
  ctx.moveTo(0, 0)
  ctx.lineTo(Math.cos(angle*i)*screenRadius, Math.sin(angle*i)*(screenRadius))
  ctx.lineTo(Math.cos(angle*(i+1))*screenRadius, Math.sin(angle*(i+1))*(screenRadius))
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

const fadeOutCircle = () => {
  ctx.save()
  ctx.fillStyle = fadeCircleGradient
  ctx.arc(0, 0, longestEdge, 0, Math.PI*2)
  ctx.fill()
  ctx.restore()
}

function init() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  // screenRadius = ctx.canvas.width / 2;
  longestEdge = Math.max(ctx.canvas.width, ctx.canvas.height)
  screenRadius = Math.sqrt(Math.pow(ctx.canvas.width/2, 2)* Math.pow(ctx.canvas.height/2, 2))
  
  ctx.translate(ctx.canvas.width * 0.7, ctx.canvas.height * 0.7)
  
  fadeCircleGradient = ctx.createRadialGradient(0, 0, longestEdge / 4, 0.001, 0.0001, longestEdge / 2)
  fadeCircleGradient.addColorStop(0, 'white')
  fadeCircleGradient.addColorStop(1, 'blue')
  
  window.requestAnimationFrame(draw)
}

function spinningBackgroundThing(tick) {
  for (let i = 0; i < triangleCount; i++) {
    triangle(i, tick)
  }
  for (let i = 0; i < altTriangleCount; i++) {
    triangle(i, tick, true)
  }
}

function draw(tick) {
  ctx.save()
  ctx.clearRect(-ctx.canvas.width/2, -ctx.canvas.height/2, ctx.canvas.width, ctx.canvas.height)
  
  spinningBackgroundThing(tick)
  
   // */
  
  // fadeOutCircle()
  ctx.restore()
  window.requestAnimationFrame(draw)
}



document.addEventListener('DOMContentLoaded', init)

