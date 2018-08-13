import { Record } from 'immutable';

export const AsyncContent = Record({
  status: 'pending',
  errorMessage: '',
  content: null,
});

export function loaded(content) {
  return AsyncContent({
    status: 'loaded',
    content,
  });
}

export function isLoaded(content) {
  return content.get('status') === 'loaded';
}

export function getContent(content) {
  return content.get('content');
}
