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
  image.src = src.replace("images/", "images/thumbs/");
  image.dataset.full = src;
  const wrapper = document.createElement("div");
  wrapper.className = "image-wrapper";
  wrapper.append(image);
  imagesFragment.append(wrapper);
});

const imagesTrack = document.createElement("div");
imagesTrack.className = "images-track";
imagesTrack.append(imagesFragment);

[...imagesTrack.children].forEach((wrapper) => {
  const duplicate = wrapper.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  imagesTrack.append(duplicate);
});

const showWhenLoaded = (image) => {
  const markLoaded = () => {
    if (image.complete && image.naturalWidth > 0) {
      image.classList.add("loaded");
    }
  };

  image.addEventListener("load", markLoaded, { once: true });
  if (image.complete && image.naturalWidth > 0) {
    requestAnimationFrame(markLoaded);
  }
};

imagesTrack.querySelectorAll("img").forEach(showWhenLoaded);

imagesContainer.append(imagesTrack);

const SPEED = 34; // píxeles por segundo
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

const imagePreview = document.createElement("div");
imagePreview.className = "image-preview";
imagePreview.setAttribute("aria-hidden", "true");
document.body.append(imagePreview);
let activeImage = null;

const trackImages = imagesTrack.querySelectorAll("img");
const setDimmed = (dimmed, selectedImage = null) => {
  trackImages.forEach((img) => {
    img.classList.toggle("dimmed", dimmed && img !== selectedImage);
  });
};

document.addEventListener("click", (event) => {
  if (!activeImage || event.target.closest(".images-track img")) return;
  imagePreview.classList.remove("active");
  imagePreview.replaceChildren();
  setDimmed(false);
  activeImage = null;
});

trackImages.forEach((image) => {
  const showPreview = () => {
    const previewImage = image.cloneNode();
    previewImage.src = image.dataset.full;
    imagePreview.replaceChildren(previewImage);
    showWhenLoaded(previewImage);
    imagePreview.classList.add("active");
    setDimmed(true, image);
    activeImage = image;
  };

  const hidePreview = () => {
    imagePreview.classList.remove("active");
    imagePreview.replaceChildren();
    setDimmed(false);
    activeImage = null;
  };

  image.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") showPreview();
  });
  image.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") hidePreview();
  });
  image.addEventListener("click", (event) => {
    if (activeImage === image || (activeImage)) {
      hidePreview();
    } else {
      showPreview();
    }
  });
});
