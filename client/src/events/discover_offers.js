import { namespace, operation } from 'Lib/event_utils';
import { pipe } from 'ramda';

const ns = namespace('discover_offers');

export const MOUNTED = ns('mounted');

export const Init = pipe(ns, operation)('init');

export const LOAD_MORE_OFFERS_REQUESTED = ns('load_more_offers_requested');

export const LoadMoreOffers = pipe(ns, operation)('load_more_offers');

export const NUMBER_OF_BLOCKS_TO_LOAD_CHANGED = ns('number_of_blocks_to_load_changed');
