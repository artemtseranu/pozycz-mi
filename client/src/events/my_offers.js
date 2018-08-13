import { pipe } from 'ramda';

import { namespace, operation } from 'Lib/event_utils';

const ns = namespace('my_offers');

export const MOUNTED = ns('mounted');

export const Init = pipe(ns, operation)('init');

export const OFFER_ADDED = ns('offer_added');
export const OFFER_CREATED = ns('offer_created');

export const OLD_OFFER_CREATED_EVENTS_LOADED = ns('old_offer_created_events_loaded');
