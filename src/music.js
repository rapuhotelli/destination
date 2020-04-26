
export function music(onReady) {
  let player;
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
  window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
    player = new window.YT.Player('player', {
      height: '195',
      width: '320',
      videoId: 'fTFxE32onKs',
      playerVars: {
        start: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1
      },
      events: {
        'onReady': (event) => onReady(event, player),
      }
    });
  }
}
