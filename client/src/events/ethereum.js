import { namespace, operation } from 'Lib/event_utils';

const ns = namespace('eth');

export const REQUIRED = ns('required');
export const Init = operation(ns('init'));

export const OFFER_CREATED_EVENT_RECEIVED = ns('offer_created_event_received');
export const OFFER_CREATED = ns('offer_created');

export const OFFER_DELETED_EVENT_RECEIVED = ns('offer_deleted_event_received');
export const OFFER_DELETED = ns('offer_deleted');
