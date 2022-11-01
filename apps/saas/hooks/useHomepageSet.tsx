import useSWR from "swr";
import { jsonToGraphQLQuery } from "json-to-graphql-query";
import {
  Dimensions,
  skylarkRequestWithDimensions,
} from "@skylark-reference-apps/lib";
import { useDimensions } from "@skylark-reference-apps/react";
import { Set } from "../types/gql";
import { createGraphQLQueryDimensions } from "../lib/utils";

const createGraphQLQuery = (lookupValue: string, dimensions: Dimensions) => {
  // Helper to use the external_id when an airtable record ID is given
  const lookupField = lookupValue.startsWith("ingestor_set")
    ? "external_id"
    : "uid";

  const fieldsToFetch: { [key: string]: boolean | object } = {
    __typename: true,
    uid: true,
    title: true,
    slug: true,
    content: {
      count: true,
      objects: {
        object: {
          __typename: true,
          slug: true,
          __on: [
            {
              __typeName: "Season",
              uid: true,
              title_short: true,
              title_medium: true,
              episodes: {
                __args: {
                  limit: 30,
                },
                objects: {
                  uid: true,
                  episode_number: true,
                  title: true,
                },
              },
            },
            {
              __typeName: "Set",
              uid: true,
              type: true,
              title_short: true,
              title_medium: true,
              content: {
                __args: {
                  limit: 30,
                },
                objects: {
                  object: {
                    __typename: true,
                    uid: true,
                  },
                },
              },
            },
          ],
        },
      },
    },
  };

  const method = `getSet`;

  const queryAsJson = {
    query: {
      __name: method,
      [method]: {
        __args: {
          [lookupField]: lookupValue,
          ...createGraphQLQueryDimensions(dimensions),
        },
        ...fieldsToFetch,
      },
    },
  };

  const query = jsonToGraphQLQuery(queryAsJson);

  return { query, method };
};

const fetcher = ([lookupValue, dimensions]: [
  lookupValue: string,
  dimensions: Dimensions
]) => {
  const { query, method } = createGraphQLQuery(lookupValue, dimensions);
  return skylarkRequestWithDimensions<{ [key: string]: Set }>(
    query,
    dimensions
  ).then(({ [method]: data }): Set => data);
};

export const useHomepageSet = () => {
  const { dimensions } = useDimensions();

  const homepageExternalId = "ingestor_set_media_reference_homepage";

  const { data, error, isLoading } = useSWR<Set, Error>(
    [homepageExternalId, dimensions],
    fetcher
  );

  return {
    data,
    isLoading: isLoading || (!error && !data),
    isError: error,
  };
};