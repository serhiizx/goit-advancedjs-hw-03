import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryEl = document.querySelector('.gallery');
const loaderEl = document.querySelector('.loader');

const lightbox = new SimpleLightbox.default('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

export function createGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
          <img class="gallery-image" src="${webformatURL}" alt="${tags}" />
        </a>
        <div class="gallery-info">
          <p><b>Likes</b> ${likes}</p>
          <p><b>Views</b> ${views}</p>
          <p><b>Comments</b> ${comments}</p>
          <p><b>Downloads</b> ${downloads}</p>
        </div>
      </li>`
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

export function clearGallery() {
  galleryEl.innerHTML = '';
}

export function showLoader() {
  loaderEl.classList.remove('hidden');
}

export function hideLoader() {
  loaderEl.classList.add('hidden');
}
