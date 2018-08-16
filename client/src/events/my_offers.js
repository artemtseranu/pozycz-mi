import { pipe } from 'ramda';

import { namespace, operation } from 'Lib/event_utils';

const ns = namespace('my_offers');

export const MOUNTED = ns('mounted');

export const Init = pipe(ns, operation)('init');

export const OFFER_ADDED = ns('offer_added');
export const OFFER_CREATED = ns('offer_created');

export const OLD_OFFER_CREATED_EVENTS_LOADED = ns('old_offer_created_events_loaded');

export const OFFER_MOUNTED = ns('offer_mounted');

export const LoadOfferDetails = pipe(ns, operation)('load_offer_details');

export const DELETE_OFFER_REQUESTED = ns('delete_offer_requested');
export const DELETE_OFFER_CANCELLED = ns('delete_offer_cancelled');
export const DELETE_OFFER_CONFIRMED = ns('delete_offer_confirmed');

export const SendDeleteOfferTx = pipe(ns, operation)('send_delete_offer_tx');
