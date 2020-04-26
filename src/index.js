import { music } from './music'

let musicPlayer;
let isFuckingGoing = false;

let canvas, ctx;

const triangleCount = 35
const angleRad = Math.PI * 2 / triangleCount

const altTriangleCount = 40;
const altAngleRad = Math.PI * 2 / altTriangleCount

const rotationAngle = Math.PI * 2 / 360

const textSize = 16;
let screenRadius = 1;
let fadeCircleGradient;
let oscLayers = []
let scale = 1;

const assets = {
}

const params = new URLSearchParams(window.location.search)
let destination = params.get('destination') || 'Post-Quarantine Party'
destination = destination.toLocaleUpperCase()
const autoStart = params.has('autoStart') || params.has('autostart')

let center = {
  x: 0,
  y: 0,
  zeroOffsetX: 0,
  zeroOffsetY: 0
}

const triangleRayColors = [
  'rgb(240, 120, 20)',
  'rgb(240, 150, 20)',
  '#E8D20C'
]

function easeInOut(t) {
  if (t < 0.5) {
    return 4 * t * t * t
  } else {
    return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  }
}

function startFuckingGoing() {
  isFuckingGoing = true
}

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
  context.moveTo(0, 0)
  context.lineTo(Math.floor(Math.cos(angle*i)*screenRadius), Math.floor(Math.sin(angle*i)*(screenRadius)))
  context.lineTo(Math.floor(Math.cos(angle*(i+1))*screenRadius), Math.floor(Math.sin(angle*(i+1))*(screenRadius)))
  context.fill()
  context.stroke()
  context.restore()
}

function createOffscreenCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth * 2
  canvas.height = window.innerHeight * 2
  canvas.ctx = canvas.getContext('2d')
  canvas.ctx.translate(canvas.width / 2, canvas.height / 2)
  return canvas
}

function getAssetLoader(assetName, path) {
  return new Promise(function(resolve) {
    assets[assetName] = new Image()
    assets[assetName].addEventListener('load', function () {
      resolve()
    })
    assets[assetName].src = path
  })
}

function loadAssets(onComplete) {
  Promise.all([
    getAssetLoader('carImage', 'assets/carsprite2-lg.png'),
    getAssetLoader('facesImage', 'assets/faces.png')
  ]).then(onComplete)
}

function init() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width  = window.innerWidth / 2
  ctx.canvas.height = window.innerHeight / 2
  
  screenRadius = Math.floor(Math.sqrt(Math.pow(ctx.canvas.width/2, 2) * Math.pow(ctx.canvas.height/2, 2)))
  
  center.x = Math.floor(ctx.canvas.width * 0.5)
  center.y = Math.floor(ctx.canvas.height * 0.5)
  center.zeroOffsetX = Math.floor(ctx.canvas.width * 0.7 - center.x)
  center.zeroOffsetY = Math.floor(ctx.canvas.height * 0.7 - center.y)
  ctx.translate(center.x, center.y)
  
  fadeCircleGradient = ctx.createRadialGradient(
    center.zeroOffsetX,
    center.zeroOffsetY,
    ctx.canvas.width * 0.1,
    center.zeroOffsetX,
    center.zeroOffsetY,
    ctx.canvas.width * 0.6
  );
  
  for(let t = 0; t <= 1; t += 0.02) {
    fadeCircleGradient.addColorStop(t, `rgba(255, 255, 0, ${easeInOut(t) * 1})`);
  }

  oscLayers[0] = createOffscreenCanvas()
  for (let i = 0; i < triangleCount; i++) {
    triangle(oscLayers[0].ctx, i, 0)
  }

  oscLayers[1] = createOffscreenCanvas()
  for (let i = 0; i < altTriangleCount; i++) {
    triangle(oscLayers[1].ctx, i, 0, true)
  }

  loadAssets(() => window.requestAnimationFrame(draw))
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

function carAnimation(frame) {
  ctx.drawImage(
    assets['carImage'],
    (isFuckingGoing && (frame % 2 === 0)) ? 0 : 188,
    0,
    188,
    68,
    center.zeroOffsetX - (94 * scale),
    center.zeroOffsetY - (34 * scale),
    188 * scale,
    68 * scale
  )
}

function createBounceFace(frame, xOffset, yOffset) {
  let lastTick = 0;
  let animationState = 0;
  let cutOffTick = 200;
  
  let direction = 1;
  
  return function (tick) {
    const currTick = tick % cutOffTick
    
    if (currTick < lastTick) {
      if (direction === 1) {
        direction = -1
      } else {
        direction = 1
      }
    }
  
    if (direction === -1) {
      animationState = cutOffTick - currTick - cutOffTick
    } else {
      animationState = currTick - cutOffTick
    }
    
    ctx.save()
    ctx.translate(center.zeroOffsetX + xOffset, center.zeroOffsetY + yOffset)
    if (isFuckingGoing) {
      ctx.rotate(rotationAngle * animationState / 10)
    }
    ctx.drawImage(
      assets['facesImage'],
      frame * 64,
      0,
      64,
      64,
      -16,
      -32,
      32,
      32
    )
    ctx.restore()
    lastTick = currTick
  }
}

const bouncyFace1 = createBounceFace(0, 40, -12)
const bouncyFace2 = createBounceFace(2, -8, -8)

function roadSign() {
  ctx.save()
  ctx.font = `${textSize}px sans-serif`;
  const { width: textWidth } = ctx.measureText(destination)
  ctx.fillStyle = 'blue'
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2;
  ctx.fillRect(-120, -textSize, textWidth + 20 + 4, textSize + 8);
  ctx.strokeRect(-120 + 2, -textSize + 2, textWidth + 20, textSize + 4);
  ctx.fillStyle = 'white'
  ctx.fillText(destination, -100, 2)
  ctx.moveTo(-115, -textSize/2 + 4)
  ctx.lineTo(-105, -textSize + 4)
  ctx.lineTo(-105, 4)
  ctx.fill()
  ctx.restore()
}


function draw(tick) {
  ctx.save()
  ctx.clearRect(-center.x, -center.y, ctx.canvas.width, ctx.canvas.height)
  
  ctx.save()
  ctx.translate(center.zeroOffsetX, center.zeroOffsetY)
  if (isFuckingGoing) {
    ctx.rotate(rotationAngle * tick / 40)
  }
  copyCachedLayer(oscLayers[0])
  ctx.restore()
  
  ctx.save()
  ctx.translate(center.zeroOffsetX, center.zeroOffsetY)
  if (isFuckingGoing) {
    ctx.rotate(rotationAngle * tick/4 / 40)
  }
  copyCachedLayer(oscLayers[1])
  ctx.restore()
  
  ctx.save()
  ctx.fillStyle = fadeCircleGradient;
  ctx.fillRect(-center.x, -center.y, ctx.canvas.width, ctx.canvas.height);
  ctx.restore()
  
  bouncyFace1(tick)
  bouncyFace2(tick)
  roadSign()
  carAnimation(Math.floor(tick / 300) % 2)
  
  ctx.restore()
  window.requestAnimationFrame(draw)
}

/*
const startButton = document.getElementById('start-button')
startButton.addEventListener('click', function() {
  musicPlayer.setVolume(75)
  musicPlayer.playVideo()
  init()
  startButton.remove()
})

 */

document.addEventListener('DOMContentLoaded', function() {
  init()
  
  if (autoStart) {
    startFuckingGoing()
  }
  
  function itsGoTime() {
    musicPlayer.playVideo()
    setTimeout(function () { musicPlayer.setVolume(75) }, 1000)
    startFuckingGoing()
    document.body.removeEventListener('click', itsGoTime)
  }
  
  music((event, player) => {
    musicPlayer = player
    document.body.addEventListener('click', itsGoTime)
  })
})

