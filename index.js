
let canvas, ctx;

const triangleCount = 30
const angleRad = Math.PI * 2 / triangleCount

const altTriangleCount = 40;
const altAngleRad = Math.PI * 2 / altTriangleCount

const rotationAngle = Math.PI * 2 / 360

let screenRadius = 1;
let screenDiagonal = 1;
let longestEdge = 0;
let fadeCircleGradient;

let oscLayers = []

let center = {
  x: 0,
  y: 0,
  zeroOffsetX: 0,
  zeroOffsetY: 0
}


const triangleRayColors = [
  'rgb(240, 120, 20)',//'#FF6B49',
  'rgb(240, 150, 20)', //'#BF5037', // 'yellow' //'#BF5037'
  '#E8D20C' // 'rgba(255,250,128,1)'
]

const triangle = (context, i, tick, alt) => {
  if (alt && i % 2 === 0) return
  const angle = alt ? altAngleRad : angleRad
  const color = alt ? 'rgb(255, 255, 0)' : triangleRayColors[i % 3]
  context.save()
  
  if (alt) {
    context.rotate(rotationAngle * tick/4 / 40)
  } else {
    context.rotate(rotationAngle * tick / 40)
  }
  context.beginPath();
  context.lineWidth = 1
  context.strokeStyle = color
  context.fillStyle = color
  // context.translate(tick, 0)
  context.moveTo(0, 0)
  context.lineTo(Math.floor(Math.cos(angle*i)*screenRadius), Math.floor(Math.sin(angle*i)*(screenRadius)))
  context.lineTo(Math.floor(Math.cos(angle*(i+1))*screenRadius), Math.floor(Math.sin(angle*(i+1))*(screenRadius)))
  context.fill()
  context.stroke()
  context.restore()
}


function createOffscreenCanvas() {
  console.log(Math.sqrt(Math.pow(ctx.canvas.width/2, 2) * Math.pow(ctx.canvas.height/2, 2)))
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth * 2
  canvas.height = window.innerHeight * 2
  canvas.ctx = canvas.getContext('2d')
  canvas.ctx.translate(canvas.width / 2, canvas.height / 2)
  return canvas
}

function init() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width  = window.innerWidth / 2
  ctx.canvas.height = window.innerHeight / 2

  longestEdge = Math.max(ctx.canvas.width, ctx.canvas.height)
  screenRadius = Math.floor(Math.sqrt(Math.pow(ctx.canvas.width/2, 2) * Math.pow(ctx.canvas.height/2, 2)))
  
  screenDiagonal = Math.floor(Math.sqrt(Math.pow(ctx.canvas.width, 2) * Math.pow(ctx.canvas.height, 2)))
  
  console.log(screenRadius, screenDiagonal)
  
  center.x = Math.floor(ctx.canvas.width * 0.5) // Math.floor(ctx.canvas.width * 0.7)
  center.y = Math.floor(ctx.canvas.height * 0.5)// Math.floor(ctx.canvas.height * 0.7)
  center.zeroOffsetX = ctx.canvas.width * 0.7 - center.x
  center.zeroOffsetY = ctx.canvas.height * 0.7 - center.y
  ctx.translate(center.x, center.y)
  
  oscLayers[0] = createOffscreenCanvas()
  for (let i = 0; i < triangleCount; i++) {
    triangle(oscLayers[0].ctx, i, 0)
  }
  
  oscLayers[1] = createOffscreenCanvas()
  for (let i = 0; i < altTriangleCount; i++) {
    triangle(oscLayers[1].ctx, i, 0, true)
  }
  
  console.log({
    window: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    mainCanvas: {
      width: canvas.width,
      height: canvas.height
    }
  })
  
  window.requestAnimationFrame(draw)
}

function copyCachedLayer(layer) {
  ctx.drawImage(
    layer,
    0,
    0,
    layer.width,
    layer.height,
    -ctx.canvas.width - layer.width / 4,
    -ctx.canvas.height - layer.height / 4,
    layer.width,
    layer.height
  );
}

function draw(tick) {
  ctx.save()
  ctx.clearRect(-center.x, -center.y, ctx.canvas.width, ctx.canvas.height)
  
  ctx.save()
  ctx.translate(center.zeroOffsetX, center.zeroOffsetY)
  ctx.rotate(rotationAngle * tick / 40)
  copyCachedLayer(oscLayers[0])
  ctx.restore()
  
  ctx.save()
  ctx.translate(center.zeroOffsetX, center.zeroOffsetY)
  ctx.rotate(rotationAngle * tick/4 / 40)
  copyCachedLayer(oscLayers[1])
  ctx.restore()
  
  ctx.restore()
  window.requestAnimationFrame(draw)
}



document.addEventListener('DOMContentLoaded', init)

