import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './markup';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
let page = 1;
let currentSum = 0;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
});

loadMore.addEventListener('click', onLoadMore);
form.addEventListener('submit', onValueSubmit);

function onValueSubmit(event) {
  event.preventDefault();
  gallery.innerHTML = '';

  const enteredValue = event.currentTarget[0].value.trim();
  if (enteredValue === '') {
    loadMore.classList.add('visibility-hidden');
    return Notiflix.Notify.failure('All fields must be filled!');
  }

  page = 1;
  currentSum = 0;

  localStorage.clear();
  localStorage.setItem('key', enteredValue);
  render();
  form.reset();
}

async function getGallery(page = 1) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '41332970-6475e351fcc31d0bbcc0ec81e';
  const q = localStorage.getItem('key');
  const image_type = 'photo';
  const orientation = 'horizontal';
  const safesearch = 'true';
  const per_page = 40;

  const queryParams = new URLSearchParams({
    key: API_KEY,
    q,
    image_type,
    page,
    per_page,
    orientation,
    safesearch,
  });
  try {
    const res = await axios.get(`${BASE_URL}?${queryParams}`);
    return await res.data;
  } catch (error) {
    throw new Error(error);
  }
}

async function render() {
  try {
    const data = await getGallery(page);

    if (!data.hits.length > 0) {
      loadMore.classList.add('visibility-hidden');
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

    check(data.hits.length, data.totalHits);
    lightbox.refresh();
  } catch (error) {
    console.log('error!', error.message);
  }
}
//
async function onLoadMore() {
  try {
    page += 1;
    const data = await render();
    lightbox.refresh();
  } catch (error) {
    console.log('error!', error);
  }
}

function check(current, total) {
  currentSum += current;
  if (currentSum >= total) {
    loadMore.classList.add('visibility-hidden');
    return Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  Notiflix.Notify.success(`Hooray! We found ${currentSum} of ${total} images`);
  loadMore.classList.remove('visibility-hidden');
}
