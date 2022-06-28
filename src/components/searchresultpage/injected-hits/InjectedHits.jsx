import CustomHits from '@/components/hits/CustomHits';
import { indexNames } from '@/config/algoliaEnvConfig';
import { queryAtom } from '@/config/searchboxConfig';
import { lazy, useState } from 'react';
import { useEffect } from 'react';
import {
  useHits,
  useInstantSearch,
  useQueryRules,
} from 'react-instantsearch-hooks-web';
import { useRecoilValue } from 'recoil';
import injectContent from './injectContent';

const NoCtaCard = lazy(() => import('@/components/hits/NoCtaCard'));
const SalesCard = lazy(() => import('@/components/hits/SalesCard'));
const InfluencerCard = lazy(() => import('@/components/hits/InfluencerCard'));

// A property that will be added to the injected index hits
const injectedIndexType = 'influencerCard';

// Maps from each injected content type to it's render component
const contentTypeComponentMap = {
  noCta: NoCtaCard,
  salesCard: SalesCard,
  [injectedIndexType]: InfluencerCard,
};

// This component renders the custom query hits, but also injects them with content from rule data or the injection Index
const InjectedHits = (props) => {
  // Get the regular hits
  const { hits } = useHits(props);

  // Get custom data from rules
  const { items: ruleData } = useQueryRules(props);

  // Get access to the results from the inject index
  const { scopedResults } = useInstantSearch();

  // Get access to the inject index name
  const { injectedContentIndex } = useRecoilValue(indexNames);

  // Get access to current query
  const query = useRecoilValue(queryAtom);

  // Will hold the hits with injected content
  const [injectedHits, setInjectedHits] = useState(hits);

  useEffect(() => {
    // Will hold the hits from injection index
    let injectionIndexResults;

    // If no query is typed, don't inject from index
    if (query.length === 0) injectionIndexResults = [];
    // If there's anything at all typed, inject them
    else {
      // Gets the hits from the injection index
      injectionIndexResults =
        // Get the hits AND add a type property, so that we can identify it later
        scopedResults.find(({ indexId }) => indexId == injectedContentIndex)
          ?.results?.hits ?? [];

      // Add the type property
      injectionIndexResults = injectionIndexResults.map((hit) => ({
        ...hit,
        type: injectedIndexType,
      }));
    }

    // Will hold all the items to be injected
    let itemsToInject;

    // Add the items from rule data
    itemsToInject = ruleData
      // Concat the inject index hits
      .concat(injectionIndexResults)
      // Only keep items with type either "noCta", "salesCard", injectedIndexType
      .filter(
        ({ type }) =>
          type == 'noCta' || type == 'salesCard' || type == injectedIndexType
      )
      // Add to each injected item the corresponding component that will render it
      .map((item) => ({
        ...item,
        _component: contentTypeComponentMap[item.type],
      }));

    // Inject items
    setInjectedHits(injectContent(hits, itemsToInject));
  }, [ruleData, hits, scopedResults, query]);

  return <CustomHits hits={injectedHits} />;
};

export default InjectedHits;
