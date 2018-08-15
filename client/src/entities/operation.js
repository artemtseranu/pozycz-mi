import { Record } from 'immutable';

import { getter } from 'Lib/entity_utils';

export const Operation = Record({
  status: 'pending',
  result: undefined,
  errorMessage: '',
});

export const getStatus = getter('status');
export const getErrorMessage = getter('errorMessage');

export function inProgress() {
  return Operation({ status: 'inProgress' });
}

export function success(result) {
  return Operation({ status: 'success', result });
}

export function failure(errorMessage) {
  return Operation({ status: 'failure', errorMessage });
}
