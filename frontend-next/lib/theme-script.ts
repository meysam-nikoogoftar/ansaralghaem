// Fixed executable text; never interpolate API data into the bootstrap script.
export const themeBootstrap = `try{var p=localStorage.getItem('theme_preference');var h=new Date().getHours();document.documentElement.dataset.theme=p==='light'||p==='dark'?p:h>=6&&h<19?'light':'dark'}catch(e){}`
