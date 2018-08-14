import { namespace, operation } from 'Lib/event_utils';
import { pipe } from 'ramda';

const ns = namespace('discover_offers');

export const MOUNTED = ns('mounted');

export const Init = pipe(ns, operation)('init');
