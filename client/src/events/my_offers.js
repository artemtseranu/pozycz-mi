import { pipe } from 'ramda';

import { namespace, operation } from 'Lib/event_utils';

const ns = namespace('my_offers');

export const MOUNTED = ns('mounted');

export const Init = pipe(ns, operation)('init');

export const OFFER_CREATED = ns('offer_created');
export const OFFER_ADDED = ns('offer_added');
