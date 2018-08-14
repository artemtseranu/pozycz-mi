import { namespace, operation } from 'Lib/event_utils';
import { pipe } from 'ramda';

const ns = namespace('ipfs');

export const LoadOfferDetails = pipe(ns, operation)('load_offer_details');
