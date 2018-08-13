import { Record } from 'immutable';

export const OperationState = Record({
  status: 'pending',
  errorMessage: '',
});

export function SuccessOperationState() {
  return OperationState({ status: 'success' });
}

export function FailureOperationState(errorMessage) {
  return OperationState({ status: 'failure', errorMessage });
}

export function getStatus(state) {
  return state.get('status');
}

export function isPending(state) {
  return getStatus(state) === 'pending';
}

export function getErrorMessage(state) {
  return state.get('errorMessage');
}
