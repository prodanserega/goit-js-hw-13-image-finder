import './sass/main.scss';
import imageCardTpl from './templates/galleryCard.hbs';

import getRefs from './js/ref';
import PicsApiService from './js/api';

import * as basicLightbox from 'basiclightbox';
import * as PNotify from '@pnotify/core/dist/PNotify';
import * as PNotifyMobile from '@pnotify/mobile/dist/PNotifyMobile';
import '@pnotify/core/dist/BrightTheme.css';
import { defaults } from '@pnotify/core';

PNotify.defaultModules.set(PNotifyMobile, {});
defaults.delay = 2000;

const refs = getRefs();

const picsApiService = new PicsApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(evt) {
  evt.preventDefault();

  picsApiService.query = evt.currentTarget.elements.query.value;

  if (picsApiService.query === '') {
    return PNotify.error({
      text: 'Please, enter something to search!',
    });
  }

  picsApiService.resetPage();
  picsApiService.fetchPictures().then(hits => {
    if (hits.length !== 0) {
      PNotify.success({
        text: 'Look, what have been found!',
      });
    } else {
      PNotify.error({
        text: 'Please, check your query!',
      });
    }

    clearGalleryContainer();
    appendPicturesMarkup(hits);
  });
}

function onLoadMore() {
  picsApiService.fetchPictures().then(appendPicturesMarkup);

  document.querySelector('.smooth-scroll').scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
}

function appendPicturesMarkup(hits) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', imageCardTpl(hits));
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}


const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && picsApiService.query !== '') {
      picsApiService.fetchPictures().then(hits => {
        appendPicturesMarkup(hits);
      });
    }
  });
};
const observer = new IntersectionObserver(onEntry, {
  rootMargin: '100px',
});
observer.observe(refs.infiniteScroll);


