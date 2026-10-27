const imagesContainer = document.querySelector("#images");

const shuffledMedia = [...window.content.media];

for (let index = shuffledMedia.length - 1; index > 0; index -= 1) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [shuffledMedia[index], shuffledMedia[randomIndex]] = [
    shuffledMedia[randomIndex],
    shuffledMedia[index],
  ];
}

const imagesFragment = document.createDocumentFragment();

shuffledMedia.forEach(({ src }) => {
  const image = document.createElement("img");
  image.src = src;
  imagesFragment.append(image);
});

const imagesTrack = document.createElement("div");
imagesTrack.className = "images-track";
imagesTrack.append(imagesFragment);

imagesTrack.querySelectorAll("img").forEach((image) => {
  const duplicate = image.cloneNode();
  duplicate.setAttribute("aria-hidden", "true");
  imagesTrack.append(duplicate);
});

imagesContainer.append(imagesTrack);

const SPEED = 100; // píxeles por segundo
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const images = [...imagesTrack.children];
const half = images.length / 2;

let position = 0;
let lastTime = null;

const getSequenceWidth = () => images[half].offsetLeft - images[0].offsetLeft;

const tick = (time) => {
  const sequenceWidth = getSequenceWidth();

  if (lastTime !== null && sequenceWidth > 0 && !reduceMotion.matches) {
    position = (position + (SPEED * (time - lastTime)) / 1000) % sequenceWidth;
    imagesTrack.style.transform = `translate3d(${-position}px, 0, 0)`;
  }

  lastTime = time;
  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);
