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

// OffscreenCanvas
let sunRayLayers = []
let roadSignOsc;

let scale = 1;

const f = Math.floor

const assets = {
}

const defaultParams = {
  destination: 'Post-Quarantine Party',
  noAutoStart: false
}

const params = new URLSearchParams(window.location.search)

/**
 * Query parameter options
 * @destination string text to display on road sign
 * @wait boolean halt animation until music begins
 * @yt string youtube video id for background music (requires click from user)
 */
let destination = params.get('destination') || 'Post-Quarantine Party'
destination = destination.toLocaleUpperCase()

const autoStart = !params.has('wait') // || params.get('wait') !== false
let musicTrack = params.has('yt') ? params.get('yt') : false // 'fTFxE32onKs'
if (musicTrack === 'disabled') {
  musicTrack = false
}


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

// unused, todo entrance animation
function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
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
  context.lineTo(f(Math.cos(angle*i)*screenRadius), f(Math.sin(angle*i)*(screenRadius)))
  context.lineTo(f(Math.cos(angle*(i+1))*screenRadius), f(Math.sin(angle*(i+1))*(screenRadius)))
  context.fill()
  context.stroke()
  context.restore()
}

function createOffscreenCanvas(width, height) {
  width = f(window.innerWidth * 2)
  height = f(window.innerHeight * 2)
  const canvas = document.createElement('canvas');
  canvas.width = width
  canvas.height = height
  canvas.ctx = canvas.getContext('2d')
  canvas.ctx.translate(f(canvas.width / 2), f(canvas.height / 2))
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
    getAssetLoader('facesImage', 'assets/faces.png'),
    getAssetLoader('shrubberyImage', 'assets/shrubbery.svg')
  ]).then(onComplete)
}

function init() {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width  = window.innerWidth / 2
  ctx.canvas.height = window.innerHeight / 2
  
  screenRadius = f(Math.sqrt(Math.pow(ctx.canvas.width/2, 2) * Math.pow(ctx.canvas.height/2, 2)))
  
  center.x = f(ctx.canvas.width * 0.5)
  center.y = f(ctx.canvas.height * 0.5)
  center.zeroOffsetX = f(ctx.canvas.width * 0.7 - center.x)
  center.zeroOffsetY = f(ctx.canvas.height * 0.7 - center.y)
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
  
  sunRayLayers[0] = createOffscreenCanvas(window.innerWidth * 2, window.innerHeight * 2)
  for (let i = 0; i < triangleCount; i++) {
    triangle(sunRayLayers[0].ctx, i, 0)
  }

  sunRayLayers[1] = createOffscreenCanvas(window.innerWidth * 2, window.innerHeight * 2)
  for (let i = 0; i < altTriangleCount; i++) {
    triangle(sunRayLayers[1].ctx, i, 0, true)
  }
  
  loadAssets(() => {
    ctx.font = `${textSize}px sans-serif`;
    const textWidth = f(ctx.measureText(destination).width)
    roadSignOsc = createOffscreenCanvas(textWidth, 40)
    createRoadSignGraphic(roadSignOsc.ctx, textWidth)
    
    window.requestAnimationFrame(draw)
  })
}

function copyCachedLayer(layer) {
  ctx.drawImage(
    layer,
    0,
    0,
    layer.width,
    layer.height,
    f(-ctx.canvas.width - layer.width / 4),
    f(-ctx.canvas.height - layer.height / 4),
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

const bouncyFace1 = createBounceFace(1, 40, -12)
const bouncyFace2 = createBounceFace(3, -8, -8)

function createRoadSignGraphic(context, textWidth) {
  
  const signWidth = f(textWidth + 20 + 4) // textWidth + triangle + border offset
  
  const rsig1 = context.createLinearGradient(signWidth/2, 0, signWidth/2 + 10, 0)
  rsig1.addColorStop(0, 'gray')
  rsig1.addColorStop(1, 'lightgray')
  
  /* todo fix positioning of poles
  const rsig2 = context.createLinearGradient(-signWidth/3, 0, -signWidth/3 + 10, 0)
  rsig2.addColorStop(0, 'gray')
  rsig2.addColorStop(1, 'lightgray')
   */
  
  context.save()
  context.translate(-120, 0)
  context.fillStyle = rsig1
  context.fillRect(f(signWidth / 2), 20, 10, center.zeroOffsetY)
  /* todo fix positioning of poles
  context.fillStyle = rsig2
  context.fillRect(f(-signWidth / 3), 20, 10, center.zeroOffsetY)
   */
  context.restore()
  
  context.save()
  context.translate(-120, 0)
  context.fillStyle = 'blue'
  context.strokeStyle = 'white'
  context.lineWidth = 2;
  context.fillRect(0, 20, signWidth, textSize + 8)
  context.strokeRect(0 + 2, 20 + 2, textWidth + 20, textSize + 4)
  context.fillStyle = 'white'
  context.font = `${textSize}px sans-serif`;
  context.fillText(destination, 20, 36 + 2 )
  context.moveTo(5, 28 + 4)
  context.lineTo(15, 20 + 4)
  context.lineTo(15, 36 + 4)
  context.fill()
  context.restore()
  
  context.save()
  
  context.drawImage(
    assets['shrubberyImage'],
    0,
    0
  )
  context.restore()

}

function draw(tick) {
  ctx.save()
  ctx.clearRect(-center.x, -center.y, ctx.canvas.width, ctx.canvas.height)
  
  ctx.save()
  ctx.translate(center.zeroOffsetX, center.zeroOffsetY)
  if (isFuckingGoing) {
    ctx.rotate(rotationAngle * tick / 40)
  }
  copyCachedLayer(sunRayLayers[0])
  ctx.restore()
  
  ctx.save()
  ctx.translate(center.zeroOffsetX, center.zeroOffsetY)
  if (isFuckingGoing) {
    ctx.rotate(rotationAngle * tick/4 / 40)
  }
  copyCachedLayer(sunRayLayers[1])
  ctx.restore()
  
  ctx.save()
  ctx.fillStyle = fadeCircleGradient;
  ctx.fillRect(-center.x, -center.y, ctx.canvas.width, ctx.canvas.height);
  ctx.restore()
  
  copyCachedLayer(roadSignOsc)

  bouncyFace1(tick)
  bouncyFace2(tick)


  carAnimation(f(tick / 300) % 2)
  
  ctx.restore()
  window.requestAnimationFrame(draw)
}

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

  if (musicTrack) {
    console.log(musicTrack)
    music(musicTrack, (event, player) => {
      musicPlayer = player
      document.body.addEventListener('click', itsGoTime)
    })
  }
})

